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

interface PostmanRequestItem {
  name: string;
  request: {
    method: "POST";
    header: Array<{ key: string; value: string }>;
    body: {
      mode: "graphql";
      graphql: {
        query: string;
        variables: string;
      };
    };
    url: string;
    description?: string;
  };
}

function defaultExampleQuery(kind: string, name: string): string {
  return `${kind} ${name} {\n  ${name}\n}`;
}

function buildRequestItem(
  manual: IntegrationManual,
  op: ReturnType<typeof sortOperations>[number],
  graphqlUrl: string
): PostmanRequestItem {
  const query = op.exampleQuery?.trim() || defaultExampleQuery(op.kind, op.name);
  const label = op.title ?? op.name;

  return {
    name: label,
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

/** Gera collection Postman v2.1 a partir do manual curado (sem credenciais). */
export function buildPostmanCollection(
  config: ProjectConfig,
  manual: IntegrationManual
): PostmanCollectionV21 {
  if (!config.graphqlUrl) {
    throw new Error("GRAPHQL_URL_REQUIRED");
  }

  const operations = sortOperations(manual);
  const items = operations.map((op) =>
    buildRequestItem(manual, op, config.graphqlUrl!)
  );

  return {
    info: {
      name: manual.title,
      description: config.description ?? `Manual de integração — ${config.name}`,
      schema: POSTMAN_SCHEMA,
    },
    item: items,
    variable: [{ key: "graphqlUrl", value: config.graphqlUrl }],
  };
}

export function postmanDownloadFilename(slug: string): string {
  return `${slug}-postman-collection.json`;
}
