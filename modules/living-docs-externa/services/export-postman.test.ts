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
    expect(tokenItem.request.body.mode).toBe("graphql");
    expect(tokenItem.request.body.graphql.query).toContain("createToken");
    expect(tokenItem.request.header).not.toContainEqual(
      expect.objectContaining({ key: "Authorization" })
    );

    const fallbackItem = collection.item[1];
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
});
