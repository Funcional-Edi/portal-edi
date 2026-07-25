/**
 * Login via SSO — MESMO CONTRATO do portal atual (regra de ouro preservada):
 * o portal autentica chamando a mutation `createToken` no SSO GraphQL. A senha
 * é validada no login e NUNCA persistida.
 *
 * ⚠️ SSO ≠ Gateway: `FUNCIONAL_SSO_GRAPHQL_URL` abre o portal; o gateway (dos
 * produtos) alimenta os manuais. Nunca inverter as URLs.
 */

import { CredentialsSignin } from "next-auth";

export interface SsoUser {
  id: string;
  email: string;
  name?: string;
}

const CREATE_TOKEN_MUTATION = `
  mutation CreateToken($login: String!, $password: String!) {
    createToken(login: $login, password: $password) {
      token
      user { id email name }
    }
  }
`;

interface CreateTokenResponse {
  data?: { createToken?: { token: string; user?: SsoUser } };
  errors?: Array<{ message: string }>;
}

export function isSsoLoginConfigured(): boolean {
  return !!process.env.FUNCIONAL_SSO_GRAPHQL_URL?.trim();
}

function getSsoGraphqlUrl(): string {
  const url = process.env.FUNCIONAL_SSO_GRAPHQL_URL?.trim();
  if (!url) throw new Error("FUNCIONAL_SSO_GRAPHQL_URL não configurada");
  return url;
}

export async function validateSsoCredentials(
  login: string,
  password: string
): Promise<SsoUser> {
  const normalizedLogin = login.trim().toLowerCase();
  try {
    const response = await fetch(getSsoGraphqlUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: CREATE_TOKEN_MUTATION,
        variables: { login, password },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = (await response.json()) as CreateTokenResponse;
    if (json.errors?.length) {
      throw new Error(json.errors.map((e) => e.message).join("; "));
    }

    const created = json.data?.createToken;
    if (!created?.token) throw new Error("createToken não retornou token");

    const email = created.user?.email?.trim().toLowerCase() ?? normalizedLogin;
    return { id: created.user?.id ?? email, email, name: created.user?.name };
  } catch (err) {
    throw classifySsoLoginError(err);
  }
}

// --- Erros classificados (mesma taxonomia do portal atual) ---

export class SsoUnavailableError extends CredentialsSignin {
  code = "sso_unavailable";
}
export class SsoInvalidCredentialsError extends CredentialsSignin {
  code = "sso_invalid_credentials";
}
export class SsoAccountLockedError extends CredentialsSignin {
  code = "sso_account_locked";
}
export class SsoMfaRequiredError extends CredentialsSignin {
  code = "sso_mfa_required";
}

export function classifySsoLoginError(err: unknown): CredentialsSignin {
  if (err instanceof CredentialsSignin) return err;
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const cause = err instanceof Error ? String(err.cause ?? "") : "";
  const combined = `${message} ${cause}`.toLowerCase();

  if (
    combined.includes("enotfound") ||
    combined.includes("econnrefused") ||
    combined.includes("fetch failed") ||
    combined.includes("network") ||
    combined.includes("getaddrinfo")
  ) {
    return new SsoUnavailableError();
  }
  if (combined.includes("mfa")) return new SsoMfaRequiredError();
  if (combined.includes("bloqueado") || combined.includes("blocked")) {
    return new SsoAccountLockedError();
  }
  return new SsoInvalidCredentialsError();
}
