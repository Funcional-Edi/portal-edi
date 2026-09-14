import { describe, expect, it } from "vitest";

import type { IntegrationManual } from "@/modules/living-docs-externa/schema/manual";
import type { ProjectConfig } from "@/modules/living-docs-externa/schema/project";
import {
  buildInsomniaExport,
  insomniaDownloadFilename,
} from "@/modules/living-docs-externa/services/export-insomnia";
import {
  buildPostmanCollection,
  postmanDownloadFilename,
} from "@/modules/living-docs-externa/services/export-postman";

const demoConfig: ProjectConfig = {
  slug: "demo",
  name: "Demo — Inventário (IM)",
  description: "Manual de demonstração",
  protocol: "graphql",
  graphqlUrl: "https://gateway-homologa.fidelize.com.br/graphql",
  published: true,
  createdAt: "2026-07-27T12:00:00.000Z",
  updatedAt: "2026-07-27T12:00:00.000Z",
};

const demoManual: IntegrationManual = {
  version: 1,
  title: "Integração IM — Inventário (demo)",
  productName: "Inventory Management",
  operations: [
    {
      kind: "mutation",
      name: "createToken",
      order: 1,
      title: "1. Obter token",
      description: "Autentique no gateway.",
      exampleQuery:
        'mutation createToken {\n  createToken(login: "<login>" password: "<senha>") { token }\n}',
    },
    {
      kind: "mutation",
      name: "saveInventories",
      order: 2,
      title: "2. Enviar carga de estoque",
    },
  ],
};

describe("buildPostmanCollection", () => {
  it("gera collection v2.1 com uma request por operação do manual", () => {
    const collection = buildPostmanCollection(demoConfig, demoManual);

    expect(collection.info.schema).toContain("collection/v2.1.0");
    expect(collection.info.name).toBe(demoManual.title);
    expect(collection.item).toHaveLength(2);
    expect(collection.variable?.[0]).toEqual({
      key: "graphqlUrl",
      value: demoConfig.graphqlUrl,
    });

    const tokenItem = collection.item[0];
    expect(tokenItem.name).toBe("1. Obter token");
    expect(tokenItem.request.method).toBe("POST");
    expect(tokenItem.request.url).toBe(demoConfig.graphqlUrl);
    expect(tokenItem.request.body?.mode).toBe("graphql");
    if (tokenItem.request.body?.mode !== "graphql") throw new Error("expected graphql body");
    expect(tokenItem.request.body.graphql.query).toContain("createToken");
    expect(tokenItem.request.header).not.toContainEqual(
      expect.objectContaining({ key: "Authorization" })
    );

    const fallbackItem = collection.item[1];
    if (fallbackItem.request.body?.mode !== "graphql") throw new Error("expected graphql body");
    expect(fallbackItem.request.body.graphql.query).toContain("saveInventories");
  });

  it("nomeia arquivo de download por slug", () => {
    expect(postmanDownloadFilename("demo")).toBe("demo-postman-collection.json");
  });

  it("exige graphqlUrl no config", () => {
    const configWithoutUrl = { ...demoConfig, graphqlUrl: undefined };
    expect(() => buildPostmanCollection(configWithoutUrl, demoManual)).toThrow(
      "GRAPHQL_URL_REQUIRED"
    );
  });

  it("gera requests REST puros quando o projeto é protocol rest", () => {
    const restConfig: ProjectConfig = {
      ...demoConfig,
      protocol: "rest",
      graphqlUrl: undefined,
      apiBaseUrl: "https://api.exemplo.com.br",
    };
    const restManual: IntegrationManual = {
      version: 1,
      title: "Integração REST",
      operations: [
        {
          kind: "rest",
          name: "autoriza",
          order: 1,
          title: "Autorizar compra",
          method: "POST",
          path: "/wsAutorizacao/service.asmx/Autoriza",
          exampleBody: '{"cartao":"123"}',
        },
      ],
    };

    const collection = buildPostmanCollection(restConfig, restManual);
    const item = collection.item[0];

    expect(item.request.method).toBe("POST");
    expect(item.request.url).toBe("https://api.exemplo.com.br/wsAutorizacao/service.asmx/Autoriza");
    expect(item.request.body?.mode).toBe("raw");
    if (item.request.body?.mode !== "raw") throw new Error("expected raw body");
    expect(item.request.body.raw).toContain("cartao");
    expect(collection.variable?.[0]).toEqual({ key: "apiBaseUrl", value: restConfig.apiBaseUrl });
  });

  it("exige apiBaseUrl para projetos rest", () => {
    const restConfigWithoutUrl: ProjectConfig = {
      ...demoConfig,
      protocol: "rest",
      graphqlUrl: undefined,
      apiBaseUrl: undefined,
    };
    expect(() => buildPostmanCollection(restConfigWithoutUrl, demoManual)).toThrow(
      "API_BASE_URL_REQUIRED"
    );
  });
});

describe("buildInsomniaExport", () => {
  it("gera export v4 com workspace e requests GraphQL", () => {
    const payload = buildInsomniaExport(demoConfig, demoManual);

    expect(payload.__export_format).toBe(4);
    expect(payload.resources.length).toBeGreaterThanOrEqual(3);

    const workspace = payload.resources.find((r) => r._type === "workspace");
    expect(workspace?.name).toBe(demoManual.title);

    const requests = payload.resources.filter((r) => r._type === "request");
    expect(requests).toHaveLength(2);
    expect(requests[0].url).toBe(demoConfig.graphqlUrl);
    expect(JSON.stringify(requests[0].body)).toContain("createToken");
  });

  it("nomeia arquivo de download por slug", () => {
    expect(insomniaDownloadFilename("demo")).toBe("demo-insomnia-export.json");
  });

  it("gera request REST puro quando o projeto é protocol rest", () => {
    const restConfig: ProjectConfig = {
      ...demoConfig,
      protocol: "rest",
      graphqlUrl: undefined,
      apiBaseUrl: "https://api.exemplo.com.br",
    };
    const restManual: IntegrationManual = {
      version: 1,
      title: "Integração REST",
      operations: [
        { kind: "rest", name: "status", order: 1, method: "GET", path: "/status" },
      ],
    };

    const payload = buildInsomniaExport(restConfig, restManual);
    const request = payload.resources.find((r) => r._type === "request");

    expect(request?.method).toBe("GET");
    expect(request?.url).toBe("https://api.exemplo.com.br/status");
  });
});
