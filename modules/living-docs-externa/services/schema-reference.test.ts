import { describe, expect, it } from "vitest";

import type { ProjectSchemaSnapshot } from "@/modules/living-docs-externa/schema/introspection";
import {
  buildOperationSchemaDetail,
  buildSchemaReferenceView,
  buildSchemaTypeDetailView,
  formatGraphQLType,
  isRequiredGraphQLType,
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

describe("buildOperationSchemaDetail", () => {
  const operationSnapshot: ProjectSchemaSnapshot = {
    version: 1,
    syncedAt: "2026-09-11T18:00:00.000Z",
    source: {
      projectSlug: "demo",
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
            name: "Mutation",
            fields: [
              {
                name: "createToken",
                description: "Autentica no gateway",
                args: [
                  {
                    name: "login",
                    description: "Login do distribuidor",
                    type: {
                      kind: "NON_NULL",
                      ofType: { kind: "SCALAR", name: "String" },
                    },
                  },
                  {
                    name: "password",
                    description: "Senha do distribuidor",
                    type: {
                      kind: "NON_NULL",
                      ofType: { kind: "SCALAR", name: "String" },
                    },
                  },
                ],
                type: { kind: "OBJECT", name: "TokenPayload" },
              },
              {
                name: "createGroupedOrder",
                args: [
                  {
                    name: "products",
                    description: "Produtos do pedido",
                    type: {
                      kind: "NON_NULL",
                      ofType: {
                        kind: "LIST",
                        ofType: {
                          kind: "NON_NULL",
                          ofType: { kind: "INPUT_OBJECT", name: "ProductInput" },
                        },
                      },
                    },
                  },
                ],
                type: { kind: "OBJECT", name: "GroupedOrder" },
              },
            ],
          },
          {
            kind: "OBJECT",
            name: "TokenPayload",
            fields: [
              {
                name: "token",
                description: "JWT válido por 24h",
                args: [],
                type: {
                  kind: "NON_NULL",
                  ofType: { kind: "SCALAR", name: "String" },
                },
              },
            ],
          },
          {
            kind: "INPUT_OBJECT",
            name: "ProductInput",
            description: "Produto do pré-pedido",
            inputFields: [
              {
                name: "ean",
                description: "Código EAN",
                type: {
                  kind: "NON_NULL",
                  ofType: { kind: "SCALAR", name: "String" },
                },
              },
            ],
          },
          {
            kind: "OBJECT",
            name: "GroupedOrder",
            fields: [{ name: "id", args: [], type: { kind: "SCALAR", name: "Int" } }],
          },
        ],
      },
    },
    summary: { typeCount: 4, queryFieldCount: 0, mutationFieldCount: 2 },
  };

  it("extrai args da requisição e campos da resposta", () => {
    const detail = buildOperationSchemaDetail(operationSnapshot, "mutation", "createToken");

    expect(detail?.operationName).toBe("createToken");
    expect(detail?.requestArgs.map((row) => row.name)).toEqual(["login", "password"]);
    expect(detail?.requestArgs[0]?.required).toBe(true);
    expect(detail?.responseTypeName).toBe("TokenPayload");
    expect(detail?.responseFields.map((row) => row.name)).toEqual(["token"]);
    expect(isRequiredGraphQLType({ kind: "NON_NULL", ofType: { kind: "SCALAR", name: "String" } })).toBe(
      true
    );
  });

  it("inclui tipos INPUT_OBJECT referenciados nos argumentos", () => {
    const detail = buildOperationSchemaDetail(
      operationSnapshot,
      "mutation",
      "createGroupedOrder"
    );

    expect(detail?.requestInputTypes).toHaveLength(1);
    expect(detail?.requestInputTypes[0]?.typeName).toBe("ProductInput");
    expect(detail?.requestInputTypes[0]?.fields.map((row) => row.name)).toEqual(["ean"]);
  });

  it("retorna null para operação inexistente", () => {
    expect(buildOperationSchemaDetail(operationSnapshot, "mutation", "inexistente")).toBeNull();
  });
});
