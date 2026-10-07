/** Papéis (RBAC) e resolução de papel por e-mail. */

export type UserRole = "admin" | "editor" | "client";

export interface PermissionsConfig {
  /** E-mail exato ou domínio (`@empresa.com`). */
  admins: string[];
  /** Operadores EDI — somente e-mail exato, nunca domínio. */
  editors: string[];
  /** E-mail exato ou domínio (`@distribuidor.com`). */
  clients: string[];
  defaultRole: UserRole;
}

/**
 * Defaults em código quando PERMISSIONS_CONFIG_JSON não está definida.
 * Em homolog/prod, defina PERMISSIONS_CONFIG_JSON com o conteúdo de
 * `data/permissions.example.json` preenchido.
 * O e-mail abaixo é o administrador padrão do ambiente local.
 *
 * Regras: e-mail exato (ex.: `admin@funcionalcorp.com.br`) ou domínio (`@empresa.com`).
 * Domínio = auto-identificação: qualquer e-mail daquele sufixo casa a regra.
 * Exceção: editors só aceitam e-mail exato (papel que escreve conteúdo).
 */
export const DEFAULT_PERMISSIONS_CONFIG: PermissionsConfig = {
  admins: ["admin@funcionalcorp.com.br"],
  editors: [],
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

/** Precedência: admin > editor > client > defaultRole. */
export function resolveRole(
  email: string | null | undefined,
  config: PermissionsConfig = DEFAULT_PERMISSIONS_CONFIG
): UserRole {
  if (!email) return config.defaultRole;
  const normalized = email.toLowerCase();
  if (config.admins.some((r) => matchesEmailRule(normalized, r))) return "admin";
  // Exato de propósito: `@dominio` em editors nunca casa.
  if (config.editors.some((r) => r.toLowerCase() === normalized)) return "editor";
  if (config.clients.some((r) => matchesEmailRule(normalized, r))) return "client";
  return config.defaultRole;
}

/** Somente admin (semântica original preservada). */
export function isAdminRole(role: UserRole): boolean {
  return role === "admin";
}

export function isEditorRole(role: UserRole): boolean {
  return role === "editor";
}

/** Admin ou editor EDI — tudo que não é client. */
export function isInternalStaffRole(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

export function canEditContent(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}
