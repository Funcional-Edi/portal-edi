import { revalidateTag } from "next/cache";

import { GatewayUrlError, validateGatewayUrl } from "@/core/security/gateway-url";
import {
  getProject,
  updateProjectConfigUpdatedAt,
} from "@/modules/living-docs-externa/repository/project-repository";
import { writeProjectSchemaSnapshot } from "@/modules/living-docs-externa/repository/schema-repository";
import { introspectionPayloadSchema } from "@/modules/living-docs-externa/schema/introspection";
import { loadGatewayCredentials } from "@/modules/living-docs-externa/services/gateway-credentials";
import { LIVING_DOCS_CACHE_TAGS } from "@/modules/living-docs-externa/services/cache-tags";

export type SyncSchemaErrorCode =
  | "PROJECT_NOT_FOUND"
  | "GATEWAY_NOT_CONNECTED"
  | "INVALID_URL"
  | "GATEWAY_UNAVAILABLE"
  | "GATEWAY_INVALID_CREDENTIALS"
  | "INTROSPECTION_FAILED";

export class SyncSchemaError extends Error {
  constructor(
    public readonly code: SyncSchemaErrorCode,
    message: string
  ) {
    super(message);
    this.name = "SyncSchemaError";
  }
}

const CREATE_TOKEN_MUTATION = `
  mutation CreateToken($login: String!, $password: String!) {
    createToken(login: $login, password: $password) {
      token
    }
  }
`;

const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        kind
        name
        description
        fields(includeDeprecated: true) {
          name
          description
          args {
            name
            description
            defaultValue
            type {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                    }
                  }
                }
              }
            }
          }
          type {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
          isDeprecated
          deprecationReason
        }
        inputFields {
          name
          description
          defaultValue
          type {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
        interfaces {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
        enumValues(includeDeprecated: true) {
          name
          description
          isDeprecated
          deprecationReason
        }
        possibleTypes {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
      }
      directives {
        name
        description
        locations
        args {
          name
          description
          defaultValue
          type {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

interface GraphqlResponse<T> {
  data?: T;
  errors?: Array<{ message?: string }>;
}

interface CreateTokenData {
  createToken?: { token: string };
}

async function fetchGateway<T>(
  graphqlUrl: string,
  payload: { query: string; variables?: Record<string, unknown> },
  token?: string
): Promise<GraphqlResponse<T>> {
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
    throw new SyncSchemaError(
      "GATEWAY_UNAVAILABLE",
      "Não foi possível conectar ao gateway informado."
    );
  }

  if (!response.ok) {
    throw new SyncSchemaError(
      "GATEWAY_UNAVAILABLE",
      `Gateway respondeu com erro HTTP ${response.status}.`
    );
  }

  try {
    return (await response.json()) as GraphqlResponse<T>;
  } catch {
    throw new SyncSchemaError(
      "GATEWAY_UNAVAILABLE",
      "Resposta do gateway não é um JSON válido."
    );
  }
}

function summarizeSchema(introspection: ReturnType<typeof introspectionPayloadSchema.parse>) {
  const schema = introspection.__schema;
  const queryTypeName = schema.queryType?.name;
  const mutationTypeName = schema.mutationType?.name;

  const queryType = queryTypeName ? schema.types.find((type) => type.name === queryTypeName) : null;
  const mutationType = mutationTypeName
    ? schema.types.find((type) => type.name === mutationTypeName)
    : null;

  return {
    typeCount: schema.types.length,
    queryFieldCount: queryType?.fields?.length ?? 0,
    mutationFieldCount: mutationType?.fields?.length ?? 0,
  };
}

export interface SyncSchemaResult {
  slug: string;
  syncedAt: string;
  typeCount: number;
  queryFieldCount: number;
  mutationFieldCount: number;
}

export async function syncSchema(slug: string): Promise<SyncSchemaResult> {
  const project = await getProject(slug);
  if (!project) {
    throw new SyncSchemaError("PROJECT_NOT_FOUND", `Projeto "${slug}" não encontrado.`);
  }

  if (!project.config.graphqlUrl) {
    throw new SyncSchemaError(
      "GATEWAY_NOT_CONNECTED",
      "Projeto ainda não possui gateway conectado."
    );
  }

  let validatedUrl: URL;
  try {
    validatedUrl = validateGatewayUrl(project.config.graphqlUrl);
  } catch (error) {
    if (error instanceof GatewayUrlError) {
      throw new SyncSchemaError("INVALID_URL", error.message);
    }
    throw error;
  }

  const credentials = await loadGatewayCredentials(slug);
  if (!credentials) {
    throw new SyncSchemaError(
      "GATEWAY_NOT_CONNECTED",
      "Credenciais do gateway não foram encontradas para este projeto."
    );
  }

  const createTokenResponse = await fetchGateway<CreateTokenData>(validatedUrl.toString(), {
    query: CREATE_TOKEN_MUTATION,
    variables: {
      login: credentials.login,
      password: credentials.password,
    },
  });

  const token = createTokenResponse.data?.createToken?.token;
  if (createTokenResponse.errors?.length || !token) {
    throw new SyncSchemaError(
      "GATEWAY_INVALID_CREDENTIALS",
      "As credenciais salvas não foram aceitas pelo gateway."
    );
  }

  const introspectionResponse = await fetchGateway<{ __schema: unknown }>(
    validatedUrl.toString(),
    { query: INTROSPECTION_QUERY },
    token
  );

  if (introspectionResponse.errors?.length || !introspectionResponse.data?.__schema) {
    throw new SyncSchemaError(
      "INTROSPECTION_FAILED",
      "Gateway não retornou um schema válido na introspection."
    );
  }

  let introspection: ReturnType<typeof introspectionPayloadSchema.parse>;
  try {
    introspection = introspectionPayloadSchema.parse(introspectionResponse.data);
  } catch {
    throw new SyncSchemaError(
      "INTROSPECTION_FAILED",
      "Payload de introspection retornado pelo gateway é inválido."
    );
  }

  const summary = summarizeSchema(introspection);
  const syncedAt = new Date().toISOString();

  await writeProjectSchemaSnapshot(slug, {
    version: 1,
    syncedAt,
    source: {
      projectSlug: slug,
      graphqlUrl: validatedUrl.toString(),
      gatewaySlug: project.config.gatewaySlug,
    },
    introspection,
    summary,
  });

  await updateProjectConfigUpdatedAt(slug);

  revalidateTag(LIVING_DOCS_CACHE_TAGS.projects);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.project(slug));

  return {
    slug,
    syncedAt,
    ...summary,
  };
}
