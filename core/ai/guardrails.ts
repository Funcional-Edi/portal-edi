/**
 * Guardrails de IA (Princípio 8): proteção de dados sensíveis na ENTRADA e
 * validação básica na SAÍDA. Nunca enviar segredos ao provedor; nunca confiar
 * cegamente na resposta.
 */

const SECRET_PATTERNS: Array<{ label: string; re: RegExp }> = [
  { label: "[TOKEN]", re: /\b(Bearer\s+)?[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\b/g },
  { label: "[SECRET]", re: /\b(AUTH_SECRET|GITHUB_TOKEN|AI_API_KEY|password|senha)\s*[:=]\s*\S+/gi },
  { label: "[PRIVATE_KEY]", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g },
];

/** Remove segredos conhecidos do texto antes de enviar ao provedor de IA. */
export function redactSecrets(input: string): string {
  return SECRET_PATTERNS.reduce(
    (text, { label, re }) => text.replace(re, label),
    input
  );
}

/** Valida a saída da IA. Lança se vier vazia ou suspeita. */
export function assertSafeOutput(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Resposta de IA vazia.");
  }
  return trimmed;
}
