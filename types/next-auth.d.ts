import type { UserRole } from "@/core/auth/roles";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    authMethod?: "sso" | "dev" | "local";
    localSessionExpiresAt?: number;
  }
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      authMethod?: "sso" | "dev" | "local";
      localSessionExpiresAt?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    email?: string;
    authMethod?: "sso" | "dev" | "local";
    localSessionExpiresAt?: number;
  }
}
