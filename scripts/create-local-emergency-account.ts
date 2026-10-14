import { randomBytes } from "node:crypto";

import { hashLocalPassword, hashRecoveryCode } from "@/core/auth/local-account";

function usage(): never {
  throw new Error(
    "Uso: node scripts/run-tsx.cjs scripts/create-local-emergency-account.ts <email> <senha-16+> [role=admin]"
  );
}

function randomRecoveryCode(): string {
  const bytes = randomBytes(6).toString("hex").toUpperCase();
  return `${bytes.slice(0, 4)}-${bytes.slice(4, 8)}-${bytes.slice(8, 12)}`;
}

function randomTotpSecretBase32(length = 32): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const random = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[random[i] % alphabet.length];
  }
  return out;
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.argv[3] ?? "";
  const roleArg = process.argv[4] === "editor" ? "editor" : "admin";

  if (!email || !email.includes("@")) usage();
  if (password.length < 16) {
    throw new Error("Senha mínima: 16 caracteres.");
  }

  const totpSecret = randomTotpSecretBase32();
  const recoveryCodes = Array.from({ length: 8 }, randomRecoveryCode);
  const recoveryCodeHashes = recoveryCodes.map((code) => hashRecoveryCode(code));
  const passwordHash = await hashLocalPassword(password);

  const account = {
    email,
    role: roleArg,
    passwordHash,
    totpSecret,
    recoveryCodeHashes,
  };

  console.log("Conta local criada. Salve em LOCAL_EMERGENCY_ACCOUNTS_JSON:");
  console.log(JSON.stringify([account], null, 2));
  console.log("\nCodigos de recuperacao (uso unico):");
  for (const code of recoveryCodes) console.log(`- ${code}`);
  console.log(
    `\nURI do Authenticator:\notpauth://totp/Portal-Edi:${encodeURIComponent(email)}?secret=${totpSecret}&issuer=Portal-Edi`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
