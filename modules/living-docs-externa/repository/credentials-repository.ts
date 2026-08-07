import { projectCredentialsPath } from "@/core/db/adapters/content-paths";
import { readContentJson, writeContentJson } from "@/core/db/adapters";

/**
 * Envelope cifrado persistido em `data/projects/{slug}/credentials.enc`.
 * O conteúdo (login/senha do gateway) só é decifrado em
 * `services/gateway-credentials.ts` — este módulo não sabe o que há dentro.
 */
export interface EncryptedCredentialsEnvelope {
  v: 1;
  iv: string;
  authTag: string;
  ciphertext: string;
}

export async function readCredentialsEnvelope(
  slug: string
): Promise<EncryptedCredentialsEnvelope | null> {
  return readContentJson<EncryptedCredentialsEnvelope>(projectCredentialsPath(slug));
}

export async function writeCredentialsEnvelope(
  slug: string,
  envelope: EncryptedCredentialsEnvelope
): Promise<void> {
  await writeContentJson(projectCredentialsPath(slug), envelope);
}
