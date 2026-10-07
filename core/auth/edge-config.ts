import type { NextAuthConfig } from "next-auth";

import type { UserRole } from "@/core/auth/roles";

/**
 * Configuração lida pelo middleware. Sem lista de acessos e sem arquivo:
 * essa camada não pode importar `node:fs`.
 * O papel já vai dentro do JWT, gravado no login pelo servidor.
 */
const trustAuthHost =
  process.env.AUTH_TRUST_HOST === "true" ||
  process.env.VERCEL === "1" ||
  process.env.NODE_ENV === "development";

export const edgeAuthConfig = {
  providers: [],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email ?? token.email;
        const role = (user as { role?: UserRole }).role;
        if (role) token.role = role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as UserRole) ?? "client";
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
  trustHost: trustAuthHost,
} satisfies NextAuthConfig;
