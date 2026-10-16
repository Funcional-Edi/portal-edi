import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { CredentialsSignin } from "next-auth";

import { appendAccessAuditEvent } from "@/core/auth/access-audit";
import { checkLoginRateLimit, getClientIp, resetLoginRateLimit } from "@/core/auth/rate-limit";
import { getRedisRestConfig, redisRestCommand } from "@/core/auth/redis-rest";
import { type UserRole } from "@/core/auth/roles";
import { readContentJson, writeContentJson } from "@/core/db/adapters";
import { GithubContentError } from "@/core/db/adapters/github-content-error";

const scrypt = promisify(scryptCallback);

const LOCAL_STATE_PATH = "data/access/local-account-state.json";
const LOCAL_STATE_BRANCH = "portal-state";
const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;
const LOCAL_RATE_LIMIT_MAX = 10;
const LOCAL_IP_RATE_LIMIT_MAX = 30;

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

type LocalAccountRole = Extract<UserRole, "admin" | "editor">;

interface LocalAccountState {
  consumedRecoveryCodeHashes: Record<string, string[]>;
}

export interface LocalEmergencyAccount {
  email: string;
  role: LocalAccountRole;
  passwordHash: string;
  totpSecret: string;
  recoveryCodeHashes: string[];
}

export class LocalLoginRateLimitError extends CredentialsSignin {
  code = "local_rate_limit";
}

export class LocalInvalidCredentialsError extends CredentialsSignin {
  code = "local_invalid_credentials";
}

/** Senha da conta de emergência confere, mas o código ainda não foi enviado. */
export class LocalMfaRequiredError extends CredentialsSignin {
  code = "local_mfa_required";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeRecoveryCode(code: string): string {
  return code.trim().replace(/[\s-]/g, "").toUpperCase();
}

function normalizeTotpInput(code: string): string {
  return code.trim().replace(/\s/g, "");
}

function parsePasswordHash(passwordHash: string): { salt: string; hash: string } | null {
  const [algo, salt, hash] = passwordHash.split("$");
  if (algo !== "scrypt" || !salt || !hash) return null;
  return { salt, hash };
}

function getPasswordPepper(): string {
  return process.env.AUTH_SECRET?.trim() ?? "";
}

export async function hashLocalPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(`${password}${getPasswordPepper()}`, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyLocalPassword(password: string, passwordHash: string): Promise<boolean> {
  const parsed = parsePasswordHash(passwordHash);
  if (!parsed) return false;
  const expected = Buffer.from(parsed.hash, "hex");
  const computed = (await scrypt(`${password}${getPasswordPepper()}`, parsed.salt, expected.length)) as Buffer;
  return timingSafeEqual(computed, expected);
}

export function hashRecoveryCode(code: string): string {
  return createHash("sha256").update(normalizeRecoveryCode(code)).digest("hex");
}

function decodeBase32(secret: string): Buffer {
  const clean = secret.toUpperCase().replace(/=+$/g, "").replace(/\s/g, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) throw new Error("TOTP secret inválido.");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((value >>> bits) & 0xff);
    }
  }
  return Buffer.from(output);
}

function hotp(secret: Buffer, counter: number): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuffer.writeUInt32BE(counter >>> 0, 4);

  const digest = createHmac("sha1", secret).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 10 ** TOTP_DIGITS;
  return String(otp).padStart(TOTP_DIGITS, "0");
}

function verifyTotpCode(secret: string, code: string, nowMs = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const secretBytes = decodeBase32(secret);
  const currentStep = Math.floor(nowMs / 1000 / TOTP_STEP_SECONDS);

  for (let drift = -1; drift <= 1; drift += 1) {
    const step = currentStep + drift;
    if (step < 0) continue;
    if (hotp(secretBytes, step) === code) return step;
  }
  return null;
}

function parseLocalAccounts(raw: string): LocalEmergencyAccount[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("LOCAL_EMERGENCY_ACCOUNTS_JSON inválido (não é JSON).");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("LOCAL_EMERGENCY_ACCOUNTS_JSON deve ser uma lista de contas.");
  }

  const emails = new Set<string>();
  const accounts: LocalEmergencyAccount[] = [];
  for (const entry of parsed) {
    if (!entry || typeof entry !== "object") throw new Error("Conta local inválida.");
    const email = normalizeEmail(String((entry as { email?: unknown }).email ?? ""));
    const roleRaw = String((entry as { role?: unknown }).role ?? "admin");
    const role: LocalAccountRole = roleRaw === "editor" ? "editor" : "admin";
    const passwordHash = String((entry as { passwordHash?: unknown }).passwordHash ?? "");
    const totpSecret = String((entry as { totpSecret?: unknown }).totpSecret ?? "").trim();
    const recoveryCodeHashesRaw = (entry as { recoveryCodeHashes?: unknown }).recoveryCodeHashes;

    if (!email.includes("@")) throw new Error("Conta local sem e-mail válido.");
    if (emails.has(email)) throw new Error("Conta local duplicada por e-mail.");
    if (!parsePasswordHash(passwordHash)) throw new Error(`passwordHash inválido para ${email}.`);
    if (!totpSecret) throw new Error(`totpSecret ausente para ${email}.`);
    if (!Array.isArray(recoveryCodeHashesRaw) || recoveryCodeHashesRaw.length === 0) {
      throw new Error(`recoveryCodeHashes ausente para ${email}.`);
    }

    const recoveryCodeHashes = recoveryCodeHashesRaw.map((item) => String(item)).filter(Boolean);
    emails.add(email);
    accounts.push({ email, role, passwordHash, totpSecret, recoveryCodeHashes });
  }
  return accounts;
}

export function isLocalEmergencyConfigured(): boolean {
  return !!process.env.LOCAL_EMERGENCY_ACCOUNTS_JSON?.trim();
}

export function loadLocalEmergencyAccounts(): LocalEmergencyAccount[] {
  const raw = process.env.LOCAL_EMERGENCY_ACCOUNTS_JSON?.trim();
  if (!raw) return [];
  return parseLocalAccounts(raw);
}

async function loadLocalState(): Promise<LocalAccountState> {
  const data = await readContentJson<unknown>(LOCAL_STATE_PATH, { ref: LOCAL_STATE_BRANCH });
  if (!data || typeof data !== "object") return { consumedRecoveryCodeHashes: {} };
  const consumed = (data as { consumedRecoveryCodeHashes?: unknown }).consumedRecoveryCodeHashes;
  if (!consumed || typeof consumed !== "object") return { consumedRecoveryCodeHashes: {} };
  const normalized: Record<string, string[]> = {};
  for (const [email, hashes] of Object.entries(consumed)) {
    if (!Array.isArray(hashes)) continue;
    normalized[normalizeEmail(email)] = hashes.filter((hash): hash is string => typeof hash === "string");
  }
  return { consumedRecoveryCodeHashes: normalized };
}

async function saveLocalState(state: LocalAccountState): Promise<void> {
  try {
    await writeContentJson(LOCAL_STATE_PATH, state, {
      branch: LOCAL_STATE_BRANCH,
      message: "chore(acesso): atualiza estado da conta local",
    });
  } catch (error) {
    if (!(error instanceof GithubContentError)) throw error;
    // ponytail: sem token de escrita o código de recuperação continua válido até a gravação existir
    console.warn("[local-account] não foi possível marcar o código de recuperação como usado.");
  }
}

const memoryUsedTotp = new Map<string, number>();

async function markTotpStepAsUsed(email: string, step: number): Promise<boolean> {
  const key = `portal-edi:local-totp:${email}:${step}`;
  if (getRedisRestConfig()) {
    try {
      const result = await redisRestCommand("set", key, 1, "ex", TOTP_STEP_SECONDS * 2, "nx");
      return result === "OK";
    } catch {
      // fallback em memória
    }
  }

  const now = Date.now();
  const usedAt = memoryUsedTotp.get(key);
  if (usedAt && now - usedAt < TOTP_STEP_SECONDS * 2 * 1000) return false;
  memoryUsedTotp.set(key, now);
  return true;
}

async function verifySecondFactor(account: LocalEmergencyAccount, mfaCode: string): Promise<boolean> {
  const code = normalizeTotpInput(mfaCode);

  if (/^\d{6}$/.test(code)) {
    const step = verifyTotpCode(account.totpSecret, code);
    if (step === null) return false;
    return markTotpStepAsUsed(account.email, step);
  }

  const state = await loadLocalState();
  const normalizedEmail = normalizeEmail(account.email);
  const usedCodes = state.consumedRecoveryCodeHashes[normalizedEmail] ?? [];
  const hashed = hashRecoveryCode(code);

  if (!account.recoveryCodeHashes.includes(hashed)) return false;
  if (usedCodes.includes(hashed)) return false;

  state.consumedRecoveryCodeHashes[normalizedEmail] = [...usedCodes, hashed];
  await saveLocalState(state);
  return true;
}

async function checkLocalRateLimit(email: string, ip: string): Promise<boolean> {
  const byEmail = await checkLoginRateLimit(`local:email:${email}`, LOCAL_RATE_LIMIT_MAX);
  const byIp = await checkLoginRateLimit(`local:ip:${ip}`, LOCAL_IP_RATE_LIMIT_MAX);
  return byEmail.allowed && byIp.allowed;
}

async function resetLocalRateLimit(email: string, ip: string): Promise<void> {
  await resetLoginRateLimit(`local:email:${email}`);
  await resetLoginRateLimit(`local:ip:${ip}`);
}

export async function authenticateLocalEmergencyUser(input: {
  email: string;
  password: string;
  mfaCode: string;
  ip: string;
}): Promise<{ id: string; email: string; role: LocalAccountRole; authMethod: "local" }> {
  const email = normalizeEmail(input.email);
  const account = loadLocalEmergencyAccounts().find((candidate) => candidate.email === email);
  if (!account) throw new LocalInvalidCredentialsError();

  const canTry = await checkLocalRateLimit(email, input.ip);
  if (!canTry) throw new LocalLoginRateLimitError();

  const passwordOk = await verifyLocalPassword(input.password, account.passwordHash);
  if (!passwordOk) throw new LocalInvalidCredentialsError();

  if (!input.mfaCode.trim()) {
    await resetLocalRateLimit(email, input.ip);
    throw new LocalMfaRequiredError();
  }

  const secondFactorOk = await verifySecondFactor(account, input.mfaCode);
  if (!secondFactorOk) throw new LocalInvalidCredentialsError();

  await resetLocalRateLimit(email, input.ip);
  await appendAccessAuditEvent({
    action: "local_login_success",
    actorEmail: email,
    detail: "Conta local de emergência usada com MFA.",
  });

  return { id: email, email, role: account.role, authMethod: "local" };
}

export function getLocalLoginIp(headers: Headers): string {
  return getClientIp(headers);
}

