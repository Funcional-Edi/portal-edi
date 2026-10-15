/**
 * Limite de tentativas de login do SSO — protege contra força bruta
 * (ver docs/arquitetura/adr/0007-rate-limit-login.md).
 *
 * Duas camadas, mesma interface:
 * - Memória local: sempre disponível, reseta se a instância reiniciar.
 * - Redis REST (opcional): sobrevive a múltiplas instâncias/serverless.
 *   Sem `KV_REST_API_URL`/`TOKEN` configurados, cai para memória — a
 *   proteção nunca fica desligada, só perde durabilidade entre instâncias.
 */

import { getRedisRestConfig, redisRestCommand } from "@/core/auth/redis-rest";

const WINDOW_MS = 15 * 60 * 1000;
const WINDOW_SEC = Math.ceil(WINDOW_MS / 1000);
const MAX_ATTEMPTS = 10;
/** IP aceita mais: escritório/NAT divide o mesmo IP. O e-mail é o limite apertado. */
const IP_MAX_ATTEMPTS = 30;
const KEY_PREFIX = "portal-edi:login-rate:";

export interface LoginRateLimitResult {
  allowed: boolean;
  /** Segundos até poder tentar de novo — só presente quando `allowed` é falso. */
  retryAfterSec?: number;
}

const memoryAttempts = new Map<string, { count: number; resetAt: number }>();

function checkMemory(key: string, max: number): LoginRateLimitResult {
  const now = Date.now();
  const entry = memoryAttempts.get(key);

  if (!entry || now >= entry.resetAt) {
    memoryAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= max) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true };
}

function resetMemory(key: string): void {
  memoryAttempts.delete(key);
}

async function checkDistributed(key: string, max: number): Promise<LoginRateLimitResult> {
  const redisKey = `${KEY_PREFIX}${key}`;
  try {
    const count = Number(await redisRestCommand("incr", redisKey));
    if (count === 1) await redisRestCommand("expire", redisKey, WINDOW_SEC);

    if (count > max) {
      const ttl = Number(await redisRestCommand("ttl", redisKey));
      return { allowed: false, retryAfterSec: ttl > 0 ? ttl : WINDOW_SEC };
    }
    return { allowed: true };
  } catch {
    // Redis fora do ar não pode derrubar o login — cai para memória.
    return checkMemory(key, max);
  }
}

async function resetDistributed(key: string): Promise<void> {
  try {
    await redisRestCommand("del", `${KEY_PREFIX}${key}`);
  } catch {
    resetMemory(key);
  }
}

/** Conta 1 tentativa em `key` e diz se ainda pode tentar login agora. */
export async function checkLoginRateLimit(
  key: string,
  max = MAX_ATTEMPTS
): Promise<LoginRateLimitResult> {
  return getRedisRestConfig() ? checkDistributed(key, max) : checkMemory(key, max);
}

/** Chave do contador por e-mail (usada para contar e para zerar após sucesso). */
export const emailKey = (email: string) => `email:${email}`;

/**
 * Tentativa de login SSO: conta por e-mail (10) E por IP (30). Basta um dos
 * dois estourar para bloquear. Chaves separadas por prefixo.
 */
export async function checkLoginAttempt(email: string, ip: string): Promise<LoginRateLimitResult> {
  const [byEmail, byIp] = await Promise.all([
    checkLoginRateLimit(emailKey(email)),
    checkLoginRateLimit(`ip:${ip}`, IP_MAX_ATTEMPTS),
  ]);
  if (byEmail.allowed && byIp.allowed) return { allowed: true };
  return {
    allowed: false,
    retryAfterSec: Math.max(byEmail.retryAfterSec ?? 0, byIp.retryAfterSec ?? 0),
  };
}

/**
 * IP do cliente a partir dos cabeçalhos do proxy. Só vale atrás de proxy que
 * sobrescreve esses cabeçalhos (Vercel, ingress). `x-real-ip` primeiro; senão a
 * ÚLTIMA entrada de `x-forwarded-for` (a que o proxy mais próximo anexou — a
 * primeira o cliente consegue forjar). Sem IP, todos caem no balde "unknown".
 * ponytail: com vários proxies confiáveis em cadeia a última entrada é o
 * proxy, não o cliente — nesse caso fazer o proxy enviar `x-real-ip`.
 */
export function getClientIp(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
}

/** Zera o contador de `key`. Chamar após login bem-sucedido (só o do e-mail; o do IP não zera). */
export async function resetLoginRateLimit(key: string): Promise<void> {
  if (getRedisRestConfig()) {
    await resetDistributed(key);
    return;
  }
  resetMemory(key);
}

/** Uso em testes: limpa todo o estado em memória entre casos. */
export function resetAllMemoryRateLimits(): void {
  memoryAttempts.clear();
}
