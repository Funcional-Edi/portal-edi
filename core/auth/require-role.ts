import { auth } from "@/core/auth";
import { loadAccessList } from "@/core/auth/access-list";
import { canEditContent, isAdminRole, type UserRole } from "@/core/auth/roles";
import { resolveRole } from "@/core/auth/roles";

interface SessionLike {
  user?: {
    role?: UserRole;
    email?: string | null;
    authMethod?: "sso" | "dev" | "local";
    localSessionExpiresAt?: number;
  };
}

export async function resolveCurrentSessionRole(session: SessionLike | null): Promise<UserRole | null> {
  const baseRole = session?.user?.role;
  const email = session?.user?.email?.trim().toLowerCase();
  if (!session?.user || !baseRole) return null;

  if (
    session.user.authMethod === "local" &&
    typeof session.user.localSessionExpiresAt === "number" &&
    Date.now() > session.user.localSessionExpiresAt
  ) {
    return null;
  }

  const role =
    session.user.authMethod === "local" || !email
      ? baseRole
      : resolveRole(email, await loadAccessList());
  session.user.role = role;
  return role;
}

/**
 * Guardas de rota API (server-side). Retornam a sessão ou `null`;
 * quem chama responde 403 JSON.
 */
async function sessionIf(allowed: (role: UserRole) => boolean) {
  const session = await auth();
  const role = await resolveCurrentSessionRole(session);
  if (!role) return null;
  if (!allowed(role)) return null;
  return session;
}

/** Somente admin (publicação, credenciais, gateway, playground, catálogo). */
export const requireAdmin = () => sessionIf(isAdminRole);
/** Admin + editor EDI: mutações de conteúdo. */
export const requireContentEditor = () => sessionIf(canEditContent);
