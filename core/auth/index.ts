import NextAuth from "next-auth";
import { authConfig } from "@/core/auth/config";

/**
 * Instância única do Auth.js. Exporta handlers (rota), auth (server/middleware),
 * signIn/signOut. Ponto estável para todos os módulos.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export { resolveRole, isAdminRole, type UserRole } from "@/core/auth/roles";
export { isSsoLoginConfigured } from "@/core/auth/sso";
