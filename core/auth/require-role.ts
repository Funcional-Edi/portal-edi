import { auth } from "@/core/auth";
import { canEditContent, isAdminRole, type UserRole } from "@/core/auth/roles";

/**
 * Guardas de rota API (server-side). Retornam a sessão ou `null`;
 * quem chama responde 403 JSON.
 */
async function sessionIf(allowed: (role: UserRole) => boolean) {
  const session = await auth();
  if (!session?.user?.role || !allowed(session.user.role)) return null;
  return session;
}

/** Somente admin (publicação, credenciais, gateway, playground, catálogo). */
export const requireAdmin = () => sessionIf(isAdminRole);
/** Admin + editor EDI: mutações de conteúdo. */
export const requireContentEditor = () => sessionIf(canEditContent);
