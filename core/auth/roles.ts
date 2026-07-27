/** Papéis (RBAC) e resolução de papel por e-mail. */

export type UserRole = "admin" | "client";

export interface PermissionsConfig {
  admins: string[];
  /** Regras de client: e-mail exato ou domínio (começa com "@"). */
  clients: string[];
  defaultRole: UserRole;
}

/**
 * Admins do time EDI. Ajuste conforme necessário; no futuro pode vir de
 * um recurso de dados (data/permissions.json ou banco).
 */
export const DEFAULT_PERMISSIONS_CONFIG: PermissionsConfig = {
  admins: ["admin@funcionalcorp.com.br", "sfoliveira@funcionalcorp.com.br"],
  clients: [],
  defaultRole: "client",
};

function matchesAdminRule(email: string, rule: string): boolean {
  return email.toLowerCase() === rule.toLowerCase();
}

function matchesClientRule(email: string, rule: string): boolean {
  if (rule.startsWith("@")) return email.toLowerCase().endsWith(rule.toLowerCase());
  return email.toLowerCase() === rule.toLowerCase();
}

export function resolveRole(
  email: string | null | undefined,
  config: PermissionsConfig = DEFAULT_PERMISSIONS_CONFIG
): UserRole {
  if (!email) return config.defaultRole;
  const normalized = email.toLowerCase();
  if (config.admins.some((r) => matchesAdminRule(normalized, r))) return "admin";
  if (config.clients.some((r) => matchesClientRule(normalized, r))) return "client";
  return config.defaultRole;
}

export function isAdminRole(role: UserRole): boolean {
  return role === "admin";
}
