import { describe, expect, it } from "vitest";

import type { ProjectSchemaSnapshot } from "@/modules/living-docs-externa/schema/introspection";
import {
  buildSchemaReferenceView,
  buildSchemaTypeDetailView,
  formatGraphQLType,
  resolveNamedType,
} from "@/modules/living-docs-externa/services/schema-reference";

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

describe("formatGraphQLType", () => {
  it("formata NON_NULL e LIST aninhados", () => {
    expect(
      formatGraphQLType({
        kind: "NON_NULL",
        ofType: {
          kind: "LIST",
          ofType: {
            kind: "NON_NULL",
            ofType: { kind: "SCALAR", name: "String" },
          },
        },
      })
    ).toBe("[String!]!");
  });
});

describe("buildSchemaTypeDetailView", () => {
  const detailSnapshot: ProjectSchemaSnapshot = {
    ...snapshot,
    introspection: {
      __schema: {
        queryType: { name: "Query" },
        mutationType: { name: "Mutation" },
        types: [
          {
            kind: "OBJECT",
            name: "Mutation",
            fields: [
              {
                name: "createToken",
                description: "Autentica",
                args: [
                  {
                    name: "login",
                    type: {
                      kind: "NON_NULL",
                      ofType: { kind: "SCALAR", name: "String" },
                    },
                  },
                  {
                    name: "password",
                    type: {
                      kind: "NON_NULL",
                      ofType: { kind: "SCALAR", name: "String" },
                    },
                  },
                ],
                type: { kind: "OBJECT", name: "TokenPayload" },
              },
            ],
          },
          {
            kind: "OBJECT",
            name: "TokenPayload",
            fields: [
              {
                name: "token",
                args: [],
                type: {
                  kind: "NON_NULL",
                  ofType: { kind: "SCALAR", name: "String" },
                },
              },
            ],
          },
          {
            kind: "ENUM",
            name: "CustomerType",
            enumValues: [
              { name: "PHARMACY", description: "Farmácia" },
              { name: "DISTRIBUTOR" },
            ],
          },
        ],
      },
    },
  };

  it("extrai campos com args e tipo de retorno", () => {
    const detail = buildSchemaTypeDetailView(detailSnapshot, "Mutation");
    expect(detail?.kind).toBe("OBJECT");
    expect(detail?.fields?.[0]?.name).toBe("createToken");
    expect(detail?.fields?.[0]?.args.map((a) => a.name)).toEqual(["login", "password"]);
    expect(detail?.fields?.[0]?.returnType.formatted).toBe("TokenPayload");
    expect(resolveNamedType({ kind: "OBJECT", name: "TokenPayload" })).toBe("TokenPayload");
  });

  it("extrai enum values", () => {
    const detail = buildSchemaTypeDetailView(detailSnapshot, "CustomerType");
    expect(detail?.enumValues?.map((v) => v.name)).toEqual(["DISTRIBUTOR", "PHARMACY"]);
  });

  it("retorna null para tipo interno ou inexistente", () => {
    expect(buildSchemaTypeDetailView(detailSnapshot, "__Schema")).toBeNull();
    expect(buildSchemaTypeDetailView(detailSnapshot, "Inexistente")).toBeNull();
  });
});
