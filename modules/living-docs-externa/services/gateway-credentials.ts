/**
 * Criptografia das credenciais do gateway (login/senha usados na mutation
 * `createToken`). Regra de ouro: essas credenciais NUNCA trafegam para o
 * browser depois de gravadas — só existem em memória do servidor durante o
 * connect e cifradas em disco (`data/projects/{slug}/credentials.enc`).
 *
 * Chave: derivada de `AUTH_SECRET` (já obrigatório para sessão JWT — ver
 * `core/config/env.ts`) via SHA-256, produzindo os 32 bytes exigidos pelo
 * AES-256-GCM. GCM é autenticado: adulterar o arquivo cifrado quebra a
 * decifragem em vez de retornar dado corrompido silenciosamente.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { requireEnv } from "@/core/config/env";
import {
  readCredentialsEnvelope,
  writeCredentialsEnvelope,
  type EncryptedCredentialsEnvelope,
} from "@/modules/living-docs-externa/repository/credentials-repository";

export interface GatewayCredentials {
  login: string;
  password: string;
}

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;

function getEncryptionKey(): Buffer {
  const secret = requireEnv("AUTH_SECRET");
  return createHash("sha256").update(secret).digest();
}

export function encryptGatewayCredentials(
  credentials: GatewayCredentials
): EncryptedCredentialsEnvelope {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const plaintext = Buffer.from(JSON.stringify(credentials), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    v: 1,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
}

export function decryptGatewayCredentials(
  envelope: EncryptedCredentialsEnvelope
): GatewayCredentials {
  const key = getEncryptionKey();
  const iv = Buffer.from(envelope.iv, "base64");
  const authTag = Buffer.from(envelope.authTag, "base64");
  const ciphertext = Buffer.from(envelope.ciphertext, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return JSON.parse(plaintext.toString("utf8")) as GatewayCredentials;
}

/** Cifra e grava as credenciais do gateway para `slug`. */
export async function saveGatewayCredentials(
  slug: string,
  credentials: GatewayCredentials
): Promise<void> {
  const envelope = encryptGatewayCredentials(credentials);
  await writeCredentialsEnvelope(slug, envelope);
}

/** Lê e decifra as credenciais do gateway. `null` se nunca conectado. */
export async function loadGatewayCredentials(
  slug: string
): Promise<GatewayCredentials | null> {
  const envelope = await readCredentialsEnvelope(slug);
  if (!envelope) return null;
  return decryptGatewayCredentials(envelope);
}
