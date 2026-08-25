import { describe, expect, it } from "vitest";

import type { ProjectSchemaSnapshot } from "@/modules/living-docs-externa/schema/introspection";
import { buildSchemaReferenceView } from "@/modules/living-docs-externa/services/schema-reference";

const snapshot: ProjectSchemaSnapshot = {
  version: 1,
  syncedAt: "2026-08-31T12:00:00.000Z",
  source: {
    projectSlug: "im",
    graphqlUrl: "https://gateway.example/graphql",
    gatewaySlug: "gw",
  },
  introspection: {
    __schema: {
      queryType: { name: "Query" },
      mutationType: { name: "Mutation" },
      types: [
        {
          kind: "OBJECT",
          name: "Query",
          fields: [
            { name: "health", description: "ok" },
            { name: "inventoryLoad" },
          ],
        },
        {
          kind: "OBJECT",
          name: "Mutation",
          fields: [{ name: "createToken" }, { name: "saveInventories" }],
        },
        { kind: "OBJECT", name: "__Schema", fields: [] },
        { kind: "SCALAR", name: "String", fields: null },
      ],
    },
  },
  summary: {
    typeCount: 4,
    queryFieldCount: 2,
    mutationFieldCount: 2,
  },
};

describe("buildSchemaReferenceView", () => {
  it("extrai queries, mutations e tipos visíveis", () => {
    const view = buildSchemaReferenceView(snapshot);

    expect(view.queryTypeName).toBe("Query");
    expect(view.mutationTypeName).toBe("Mutation");
    expect(view.queries.map((q) => q.name)).toEqual(["health", "inventoryLoad"]);
    expect(view.mutations.map((m) => m.name)).toEqual(["createToken", "saveInventories"]);
    expect(view.types.map((t) => t.name)).toEqual(["Mutation", "Query", "String"]);
    expect(view.types.some((t) => t.name.startsWith("__"))).toBe(false);
  });

  it("ordena campos alfabeticamente", () => {
    const view = buildSchemaReferenceView(snapshot);
    expect(view.queries[0]?.name).toBe("health");
    expect(view.mutations[0]?.name).toBe("createToken");
  });
});
