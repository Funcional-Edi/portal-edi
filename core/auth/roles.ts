/** Papéis (RBAC) e resolução de papel por e-mail. */

export type UserRole = "admin" | "client";

export interface PermissionsConfig {
  /** E-mail exato ou domínio (`@empresa.com`). */
  admins: string[];
  /** E-mail exato ou domínio (`@distribuidor.com`). */
  clients: string[];
  defaultRole: UserRole;
}

/**
 * Defaults em código quando `data/permissions.json` não existe.
 * Em homolog/prod, copie `data/permissions.example.json` → `data/permissions.json`
 * ou configure PERMISSIONS_CONFIG_JSON.
 * O e-mail abaixo é o administrador padrão do ambiente local.
 *
 * Regras: e-mail exato (ex.: `admin@funcionalcorp.com.br`) ou domínio (`@empresa.com`).
 * Domínio = auto-identificação: qualquer e-mail daquele sufixo casa a regra.
 */
export const DEFAULT_PERMISSIONS_CONFIG: PermissionsConfig = {
  admins: ["admin@funcionalcorp.com.br"],
  clients: ["@distribuidor.com"],
  defaultRole: "client",
};

/** E-mail exato ou domínio começando com `@` (ex.: `@empresa.com`). */
export function matchesEmailRule(email: string, rule: string): boolean {
  const normalizedEmail = email.toLowerCase();
  const normalizedRule = rule.toLowerCase();
  if (normalizedRule.startsWith("@")) {
    return normalizedEmail.endsWith(normalizedRule);
  }
  return normalizedEmail === normalizedRule;
}

export function resolveRole(
  email: string | null | undefined,
  config: PermissionsConfig = DEFAULT_PERMISSIONS_CONFIG
): UserRole {
  if (!email) return config.defaultRole;
  const normalized = email.toLowerCase();
  if (config.admins.some((r) => matchesEmailRule(normalized, r))) return "admin";
  if (config.clients.some((r) => matchesEmailRule(normalized, r))) return "client";
  return config.defaultRole;
}

export function isAdminRole(role: UserRole): boolean {
  return role === "admin";
}
