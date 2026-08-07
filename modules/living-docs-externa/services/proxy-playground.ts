/**
 * Proxy do playground GraphQL (Fase 4.2).
 *
 * Encaminha uma query já validada pela allowlist (`playground-allowlist.ts`)
 * ao gateway real do projeto, 100% server-side:
 *
 * 1) Carrega o projeto (só published — mesmo critério do leitor público).
 * 2) Carrega as credenciais cifradas do gateway e obtém um token via
 *    `createToken` (mesmo fluxo de `connect-gateway.ts`/`sync-schema.ts`).
 *    O token nunca é persistido nem devolvido ao chamador.
 * 3) Encaminha a query ao gateway com `Authorization: Bearer <token>`.
 * 4) Devolve `{ data, errors }` — erros de negócio da query (ex.: validação
 *    de argumentos) não são erro de proxy, só passam adiante como resposta
 *    GraphQL normal.
 *
 * Falhas de infraestrutura (projeto não publicado, gateway não conectado,
 * URL inválida, gateway fora do ar, credenciais salvas rejeitadas) viram
 * `PlaygroundProxyError` com um `code` mapeável a status HTTP pelo BFF.
 */

import { GatewayUrlError, validateGatewayUrl } from "@/core/security/gateway-url";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";
import { loadGatewayCredentials } from "@/modules/living-docs-externa/services/gateway-credentials";

export type PlaygroundProxyErrorCode =
  | "PROJECT_NOT_FOUND"
  | "GATEWAY_NOT_CONNECTED"
  | "INVALID_URL"
  | "GATEWAY_UNAVAILABLE"
  | "GATEWAY_INVALID_CREDENTIALS";

export class PlaygroundProxyError extends Error {
  constructor(
    public readonly code: PlaygroundProxyErrorCode,
    message: string
  ) {
    super(message);
    this.name = "PlaygroundProxyError";
  }
}

const CREATE_TOKEN_MUTATION = `
  mutation CreateToken($login: String!, $password: String!) {
    createToken(login: $login, password: $password) {
      token
    }
  }
`;

interface GraphqlResponse {
  data?: unknown;
  errors?: Array<{ message?: string }>;
}

interface CreateTokenData {
  createToken?: { token: string };
}

async function postToGateway(
  graphqlUrl: string,
  payload: { query: string; variables?: Record<string, unknown> },
  token?: string
): Promise<GraphqlResponse> {
  let response: Response;
  try {
    response = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new PlaygroundProxyError(
      "GATEWAY_UNAVAILABLE",
      "Não foi possível conectar ao gateway do projeto."
    );
  }

  if (!response.ok) {
    throw new PlaygroundProxyError(
      "GATEWAY_UNAVAILABLE",
      `Gateway respondeu com erro HTTP ${response.status}.`
    );
  }

  try {
    return (await response.json()) as GraphqlResponse;
  } catch {
    throw new PlaygroundProxyError(
      "GATEWAY_UNAVAILABLE",
      "Resposta do gateway não é um JSON válido."
    );
  }
}

async function obtainGatewayToken(graphqlUrl: string, slug: string): Promise<string> {
  const credentials = await loadGatewayCredentials(slug);
  if (!credentials) {
    throw new PlaygroundProxyError(
      "GATEWAY_NOT_CONNECTED",
      "Projeto ainda não possui gateway conectado."
    );
  }

  const response = await postToGateway(graphqlUrl, {
    query: CREATE_TOKEN_MUTATION,
    variables: { login: credentials.login, password: credentials.password },
  });

  const token = (response.data as CreateTokenData | undefined)?.createToken?.token;
  if (response.errors?.length || !token) {
    throw new PlaygroundProxyError(
      "GATEWAY_INVALID_CREDENTIALS",
      "As credenciais salvas do gateway não foram aceitas."
    );
  }

  return token;
}

export interface PlaygroundGraphqlResult {
  data?: unknown;
  errors?: Array<{ message?: string }>;
}

/** Executa `query` (já validada pela allowlist) contra o gateway de `slug`. */
export async function runPlaygroundQuery(
  slug: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<PlaygroundGraphqlResult> {
  const project = await getPublishedManual(slug);
  if (!project) {
    throw new PlaygroundProxyError(
      "PROJECT_NOT_FOUND",
      `Projeto "${slug}" não encontrado ou manual não publicado.`
    );
  }

  if (!project.config.graphqlUrl) {
    throw new PlaygroundProxyError(
      "GATEWAY_NOT_CONNECTED",
      "Projeto ainda não possui gateway conectado."
    );
  }

  let validatedUrl: URL;
  try {
    validatedUrl = validateGatewayUrl(project.config.graphqlUrl);
  } catch (error) {
    if (error instanceof GatewayUrlError) {
      throw new PlaygroundProxyError("INVALID_URL", error.message);
    }
    throw error;
  }

  const token = await obtainGatewayToken(validatedUrl.toString(), slug);

  const result = await postToGateway(validatedUrl.toString(), { query, variables }, token);
  return { data: result.data, errors: result.errors };
}
