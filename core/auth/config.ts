import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getPermissionsConfig } from "@/core/auth/permissions-config";
import { checkLoginRateLimit, resetLoginRateLimit } from "@/core/auth/rate-limit";
import { resolveRole, type UserRole } from "@/core/auth/roles";
import { isSsoLoginConfigured, validateSsoCredentials } from "@/core/auth/sso";
const isDevAuthEnabled =
  process.env.NODE_ENV === "development" && process.env.DEV_AUTH_ENABLED === "true";

const providers: NextAuthConfig["providers"] = [];

// Provider SSO — só monta se FUNCIONAL_SSO_GRAPHQL_URL estiver configurada.
if (isSsoLoginConfigured()) {
  providers.push(
    Credentials({
      id: "sso",
      name: "SSO",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();
        if (!email || !password) return null;
        const user = await validateSsoCredentials(email, password);
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email.split("@")[0],
          role: resolveRole(user.email, getPermissionsConfig()),
        };
      },
    })
  );
}

// Provider dev — LOCAL ONLY (nunca em produção). Login por e-mail, sem senha.
if (isDevAuthEnabled) {
  providers.push(
    Credentials({
      id: "dev",
      name: "Dev Login",
      credentials: { email: { label: "E-mail", type: "email" } },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        if (!email || !email.includes("@")) return null;

        const rateLimit = await checkLoginRateLimit(`dev:${email}`);
        if (!rateLimit.allowed) return null;

        await resetLoginRateLimit(`dev:${email}`);
        return {
          id: email,
          email,
          name: email.split("@")[0],
          role: resolveRole(email, getPermissionsConfig()),
        };
      },    })
  );
}

const trustAuthHost =
  process.env.AUTH_TRUST_HOST === "true" ||
  process.env.VERCEL === "1" ||
  process.env.NODE_ENV === "development";

export const authConfig = {
  providers,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email ?? token.email;
        token.role = (user as { role?: UserRole }).role ?? resolveRole(token.email, getPermissionsConfig());
      } else if (token.email && !token.role) {
        token.role = resolveRole(token.email as string, getPermissionsConfig());
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

