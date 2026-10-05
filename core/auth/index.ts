import NextAuth from "next-auth";
import { authConfig } from "@/core/auth/config";

/**
 * Instância do Auth.js no servidor. Exporta handlers (rota), auth, signIn/signOut.
 * O middleware usa `edge-config`, sem a lista de acessos.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export {
  resolveRole,
  isAdminRole,
  isEditorRole,
  isInternalStaffRole,
  canEditContent,
  type UserRole,
} from "@/core/auth/roles";
export {
  canAccessLevel,
  canAccessModule,
  canAccessPath,
  findModuleForPath,
  getForbiddenRedirectPath,
  isPublicPath,
  isSafeCallbackUrl,
  pathRequiresAuth,
  resolvePostLoginPath,
} from "@/core/auth/module-access";
export { isSsoLoginConfigured } from "@/core/auth/sso";
