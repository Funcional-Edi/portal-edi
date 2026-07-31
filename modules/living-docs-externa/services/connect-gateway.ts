/**
 * Conecta um projeto ao gateway GraphQL do produto (Fase 3.2).
 *
 * Fluxo: valida entrada → valida URL (anti-SSRF, `core/security/gateway-url`)
 * → confirma que o projeto existe → chama `createToken` no gateway só para
 * validar login/senha (o token expira e NÃO é persistido) → cifra e grava
 * as credenciais → atualiza `config.json` → invalida cache.
 *
 * ⚠️ Gateway ≠ SSO (`FUNCIONAL_SSO_GRAPHQL_URL`). Nunca confundir as URLs.
 */

import { revalidateTag } from "next/cache";

import { GatewayUrlError, validateGatewayUrl } from "@/core/security/gateway-url";
import { connectGatewayInputSchema } from "@/modules/living-docs-externa/schema/project";
import {
  getProject,
  updateProjectGatewayConfig,
} from "@/modules/living-docs-externa/repository/project-repository";
import { saveGatewayCredentials } from "@/modules/living-docs-externa/services/gateway-credentials";
import { LIVING_DOCS_CACHE_TAGS } from "@/modules/living-docs-externa/services/cache-tags";
import type { ProjectConfig } from "@/modules/living-docs-externa/schema/project";

export type ConnectGatewayErrorCode =
  | "VALIDATION"
  | "INVALID_URL"
  | "PROJECT_NOT_FOUND"
  | "GATEWAY_UNAVAILABLE"
  | "GATEWAY_INVALID_CREDENTIALS";

export class ConnectGatewayError extends Error {
  constructor(
    public readonly code: ConnectGatewayErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ConnectGatewayError";
  }
}

const CREATE_TOKEN_MUTATION = `
  mutation CreateToken($login: String!, $password: String!) {
    createToken(login: $login, password: $password) {
      token
    }
  }
`;

interface CreateTokenResponse {
  data?: { createToken?: { token: string } };
  errors?: Array<{ message: string }>;
}

async function verifyGatewayCredentials(
  graphqlUrl: string,
  login: string,
  password: string
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(graphqlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: CREATE_TOKEN_MUTATION,
        variables: { login, password },
      }),
    });
  } catch {
    throw new ConnectGatewayError(
      "GATEWAY_UNAVAILABLE",
      "Não foi possível conectar ao gateway informado."
    );
  }

  if (!response.ok) {
    throw new ConnectGatewayError(
      "GATEWAY_UNAVAILABLE",
      `Gateway respondeu com erro HTTP ${response.status}.`
    );
  }

  let json: CreateTokenResponse;
  try {
    json = (await response.json()) as CreateTokenResponse;
  } catch {
    throw new ConnectGatewayError(
      "GATEWAY_UNAVAILABLE",
      "Resposta do gateway não é um JSON válido."
    );
  }

  if (json.errors?.length || !json.data?.createToken?.token) {
    throw new ConnectGatewayError(
      "GATEWAY_INVALID_CREDENTIALS",
      "Login e senha não foram aceitos pelo gateway."
    );
  }
}

export async function connectGateway(
  slug: string,
  input: unknown
): Promise<ProjectConfig> {
  const parsed = connectGatewayInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ConnectGatewayError("VALIDATION", parsed.error.message);
  }

  let validatedUrl: URL;
  try {
    validatedUrl = validateGatewayUrl(parsed.data.graphqlUrl);
  } catch (error) {
    if (error instanceof GatewayUrlError) {
      throw new ConnectGatewayError("INVALID_URL", error.message);
    }
    throw error;
  }

  const project = await getProject(slug);
  if (!project) {
    throw new ConnectGatewayError("PROJECT_NOT_FOUND", `Projeto "${slug}" não encontrado.`);
  }

  await verifyGatewayCredentials(validatedUrl.toString(), parsed.data.login, parsed.data.password);

  await saveGatewayCredentials(slug, {
    login: parsed.data.login,
    password: parsed.data.password,
  });

  const config = await updateProjectGatewayConfig(slug, {
    graphqlUrl: validatedUrl.toString(),
    gatewaySlug: parsed.data.gatewaySlug ?? slug,
  });

  revalidateTag(LIVING_DOCS_CACHE_TAGS.projects);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.project(slug));

  return config;
}
