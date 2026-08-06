import { sortOperations, type IntegrationManual } from "@/modules/living-docs-externa/schema/manual";
import type { ProjectConfig } from "@/modules/living-docs-externa/schema/project";

interface InsomniaResource {
  _type: string;
  _id: string;
  parentId?: string | null;
  modified: number;
  created: number;
  [key: string]: unknown;
}

export interface InsomniaExportV4 {
  _type: "export";
  __export_format: 4;
  __export_date: string;
  __export_source: "portal-integracao";
  resources: InsomniaResource[];
}

function defaultExampleQuery(kind: string, name: string): string {
  return `${kind} ${name} {\n  ${name}\n}`;
}

function graphqlBodyText(query: string): string {
  return JSON.stringify({ query });
}

/** Gera export Insomnia v4 a partir do manual curado (sem credenciais). */
export function buildInsomniaExport(
  config: ProjectConfig,
  manual: IntegrationManual
): InsomniaExportV4 {
  if (!config.graphqlUrl) {
    throw new Error("GRAPHQL_URL_REQUIRED");
  }

  const now = Date.now();
  const workspaceId = `wrk_${config.slug}`;
  const resources: InsomniaResource[] = [
    {
      _type: "workspace",
      _id: workspaceId,
      parentId: null,
      modified: now,
      created: now,
      name: manual.title,
      description: config.description ?? `Manual de integração — ${config.name}`,
    },
  ];

  for (const op of sortOperations(manual)) {
    const requestId = `req_${config.slug}_${op.kind}_${op.name}`;
    const query = op.exampleQuery?.trim() || defaultExampleQuery(op.kind, op.name);

    resources.push({
      _type: "request",
      _id: requestId,
      parentId: workspaceId,
      modified: now,
      created: now,
      name: op.title ?? op.name,
      description: op.description ?? "",
      url: config.graphqlUrl,
      method: "POST",
      body: {
        mimeType: "application/graphql",
        text: graphqlBodyText(query),
      },
      headers: [{ name: "Content-Type", value: "application/json" }],
    });
  }

  return {
    _type: "export",
    __export_format: 4,
    __export_date: new Date(now).toISOString(),
    __export_source: "portal-integracao",
    resources,
  };
}

export function insomniaDownloadFilename(slug: string): string {
  return `${slug}-insomnia-export.json`;
}
