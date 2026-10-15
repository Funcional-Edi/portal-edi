import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { loadAccessList } from "@/core/auth/access-list";
import { edgeAuthConfig } from "@/core/auth/edge-config";
import { markFirstAccess } from "@/core/auth/first-access";
import {
  authenticateLocalEmergencyUser,
  getLocalLoginIp,
  isLocalEmergencyConfigured,
  LocalInvalidCredentialsError,
  LocalLoginRateLimitError,
  LocalMfaRequiredError,
} from "@/core/auth/local-account";
import { checkLoginRateLimit, getClientIp, resetLoginRateLimit } from "@/core/auth/rate-limit";
import { resolveRole, type UserRole } from "@/core/auth/roles";
import { isSsoLoginConfigured, validateSsoCredentials } from "@/core/auth/sso";
import { env } from "@/core/config/env";

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
      async authorize(credentials, request) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();
        if (!email || !password) return null;
        const user = await validateSsoCredentials(email, password, getClientIp(request.headers));
        const accessList = await loadAccessList();
        const role = resolveRole(user.email, accessList);
        await markFirstAccess(user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email.split("@")[0],
          role,
          authMethod: "sso",
        };
      },
    })
  );
}

if (isLocalEmergencyConfigured()) {
  providers.push(
    Credentials({
      id: "local",
      name: "Conta local",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
        mfaCode: { label: "Codigo MFA", type: "text" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();
        const mfaCode = credentials?.mfaCode?.toString() ?? "";
        if (!email || !password) return null;

        let user: Awaited<ReturnType<typeof authenticateLocalEmergencyUser>>;
        try {
          user = await authenticateLocalEmergencyUser({
            email,
            password,
            mfaCode,
            ip: getLocalLoginIp(request.headers),
          });
        } catch (error) {
          if (error instanceof LocalMfaRequiredError || error instanceof LocalLoginRateLimitError) {
            throw error;
          }
          if (error instanceof LocalInvalidCredentialsError && !mfaCode.trim()) return null;
          throw error;
        }

        await markFirstAccess(user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.email.split("@")[0],
          role: user.role,
          authMethod: user.authMethod,
        };
      },
    })
  );
}

// Provider dev — local e Preview protegido pela Vercel. Nunca habilitar em produção.
// Com SSO configurado o provider nem existe: esconder só o botão deixaria a rota aberta.
if (env.isDevLoginAvailable) {
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
        await markFirstAccess(email);
        return {
          id: email,
          email,
          name: email.split("@")[0],
          role: resolveRole(email, await loadAccessList()),
          authMethod: "dev",
        };
      },    })
  );
}

export const authConfig = {
  ...edgeAuthConfig,
  providers,
  callbacks: {
    ...edgeAuthConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email ?? token.email;
        token.authMethod = (user as { authMethod?: string }).authMethod ?? "sso";
        token.role = (user as { role?: UserRole }).role ?? token.role;

        if (token.authMethod === "local") {
          const localSessionExpiresAt = Date.now() + 60 * 60 * 1000;
          token.localSessionExpiresAt = localSessionExpiresAt;
          token.exp = Math.floor(localSessionExpiresAt / 1000);
        }
      } else if (token.email && token.authMethod !== "local") {
        token.role = resolveRole(token.email as string, await loadAccessList());
      }
      return token;
    },
  },
} satisfies NextAuthConfig;

