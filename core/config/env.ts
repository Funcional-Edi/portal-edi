/**
 * Configuração tipada da aplicação. Centraliza a leitura de env — nenhum módulo
 * lê `process.env` cru. Segredos só server-side; nunca expostos ao browser.
 * Edge-safe: sem `fs` e sem side effects no import.
 */

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  return value;
}

export function optionalEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get isDevelopment() {
    return process.env.NODE_ENV === "development";
  },
  get isDevAuthEnabled() {
    return (
      (process.env.NODE_ENV === "development" ||
        process.env.VERCEL_ENV === "preview") &&
      process.env.DEV_AUTH_ENABLED === "true"
    );
  },
  get isSsoConfigured() {
    return !!process.env.FUNCIONAL_SSO_GRAPHQL_URL?.trim();
  },
  get aiProvider() {
    return process.env.AI_PROVIDER?.trim() || "stub";
  },
  get isAiConfigured() {
    return this.aiProvider !== "stub" && !!process.env.AI_API_KEY;
  },
  get contentRoot() {
    return process.env.CONTENT_ROOT?.trim() || process.cwd();
  },
};

/** Raiz do CMS (content/ + data/). Ver ADR-0009. */
export function getContentRoot(): string {
  return env.contentRoot;
}

/** Validação opt-in do ambiente. Retorna problemas (vazio = ok). */
export function validateEnv(): string[] {
  const problems: string[] = [];
  if (!process.env.AUTH_SECRET) {
    problems.push("AUTH_SECRET ausente (sessão JWT + criptografia).");
  }
  if (
    env.isProduction &&
    process.env.DEV_AUTH_ENABLED === "true" &&
    process.env.VERCEL_ENV !== "preview"
  ) {
    problems.push("DEV_AUTH_ENABLED=true em produção — proibido (login dev bypassa SSO).");
  }
  const isPublicProduction = env.isProduction && process.env.VERCEL_ENV !== "preview";
  if (isPublicProduction && !env.isSsoConfigured) {
    problems.push("FUNCIONAL_SSO_GRAPHQL_URL ausente em produção.");
  }
  if (isPublicProduction && !process.env.GATEWAY_URL_ALLOWED_HOSTS?.trim()) {
    problems.push("GATEWAY_URL_ALLOWED_HOSTS ausente em produção (allowlist de gateways).");
  }
  if (env.aiProvider !== "stub" && !process.env.AI_API_KEY) {
    problems.push(`AI_PROVIDER=${env.aiProvider} sem AI_API_KEY.`);
  }
  return problems;
}
