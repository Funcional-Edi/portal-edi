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

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Gera export Insomnia v4 a partir do manual curado (sem credenciais). */
export function buildInsomniaExport(
  config: ProjectConfig,
  manual: IntegrationManual
): InsomniaExportV4 {
  const isRest = config.protocol === "rest";
  const baseUrl = isRest ? config.apiBaseUrl : config.graphqlUrl;
  if (!baseUrl) {
    throw new Error(isRest ? "API_BASE_URL_REQUIRED" : "GRAPHQL_URL_REQUIRED");
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
    const isRestOp = isRest || op.kind === "rest";

    resources.push(
      isRestOp
        ? {
            _type: "request",
            _id: requestId,
            parentId: workspaceId,
            modified: now,
            created: now,
            name: op.title ?? op.name,
            description: op.description ?? "",
            url: joinUrl(config.apiBaseUrl ?? baseUrl, op.path ?? "/"),
            method: op.method ?? "GET",
            body: op.exampleBody?.trim()
              ? { mimeType: "application/json", text: op.exampleBody }
              : {},
            headers: [{ name: "Content-Type", value: "application/json" }],
          }
        : {
            _type: "request",
            _id: requestId,
            parentId: workspaceId,
            modified: now,
            created: now,
            name: op.title ?? op.name,
            description: op.description ?? "",
            url: config.graphqlUrl ?? baseUrl,
            method: "POST",
            body: {
              mimeType: "application/graphql",
              text: graphqlBodyText(op.exampleQuery?.trim() || defaultExampleQuery(op.kind, op.name)),
            },
            headers: [{ name: "Content-Type", value: "application/json" }],
          }
    );
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
