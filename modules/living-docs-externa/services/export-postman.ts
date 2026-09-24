import { sortOperations, type IntegrationManual } from "@/modules/living-docs-externa/schema/manual";
import type { ProjectConfig } from "@/modules/living-docs-externa/schema/project";

const POSTMAN_SCHEMA =
  "https://schema.getpostman.com/json/collection/v2.1.0/collection.json";

export interface PostmanCollectionV21 {
  info: {
    name: string;
    description?: string;
    schema: typeof POSTMAN_SCHEMA;
  };
  item: PostmanRequestItem[];
  variable?: Array<{ key: string; value: string }>;
}

type PostmanBody =
  | { mode: "graphql"; graphql: { query: string; variables: string } }
  | { mode: "raw"; raw: string; options?: { raw: { language: "json" } } };

interface PostmanRequestItem {
  name: string;
  request: {
    method: string;
    header: Array<{ key: string; value: string }>;
    body?: PostmanBody;
    url: string;
    description?: string;
  };
}

function buildGraphqlRequestItem(
  op: ReturnType<typeof sortOperations>[number],
  graphqlUrl: string
): PostmanRequestItem {
  const query = op.exampleQuery?.trim() || `${op.kind} ${op.name} {\n  ${op.name}\n}`;

  return {
    name: op.title ?? op.name,
    request: {
      method: "POST",
      header: [{ key: "Content-Type", value: "application/json" }],
      body: {
        mode: "graphql",
        graphql: { query, variables: "" },
      },
      url: graphqlUrl,
      description: op.description,
    },
  };
}

function buildRestRequestItem(
  op: ReturnType<typeof sortOperations>[number],
  apiBaseUrl: string
): PostmanRequestItem {
  const path = op.path ?? "/";

  return {
    name: op.title ?? op.name,
    request: {
      method: op.method ?? "GET",
      header: [{ key: "Content-Type", value: "application/json" }],
      body: op.exampleBody?.trim()
        ? { mode: "raw", raw: op.exampleBody, options: { raw: { language: "json" } } }
        : undefined,
      url: `${apiBaseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`,
      description: op.description,
    },
  };
}

/** Gera collection Postman v2.1 a partir do manual curado (sem credenciais). */
export function buildPostmanCollection(
  config: ProjectConfig,
  manual: IntegrationManual
): PostmanCollectionV21 {
  const isRest = config.protocol === "rest";
  const baseUrl = isRest ? config.apiBaseUrl : config.graphqlUrl;
  if (!baseUrl) {
    throw new Error(isRest ? "API_BASE_URL_REQUIRED" : "GRAPHQL_URL_REQUIRED");
  }

  const operations = sortOperations(manual);
  const items = operations.map((op) =>
    isRest || op.kind === "rest"
      ? buildRestRequestItem(op, config.apiBaseUrl ?? baseUrl)
      : buildGraphqlRequestItem(op, config.graphqlUrl ?? baseUrl)
  );

  return {
    info: {
      name: manual.title,
      description: config.description ?? `Manual de integração — ${config.name}`,
      schema: POSTMAN_SCHEMA,
    },
    item: items,
    variable: [{ key: isRest ? "apiBaseUrl" : "graphqlUrl", value: baseUrl }],
  };
}

export function postmanDownloadFilename(slug: string): string {
  return `${slug}-postman-collection.json`;
}
