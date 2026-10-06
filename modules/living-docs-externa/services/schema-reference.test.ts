import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildClientSchema,
  getVariableValues,
  Kind,
  parse,
  validate,
} from "graphql";

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
              {
                name: "user",
                args: [],
                type: { kind: "OBJECT", name: "User" },
              },
            ],
          },
          {
            kind: "OBJECT",
            name: "User",
            fields: [{ name: "name", args: [], type: { kind: "SCALAR", name: "String" } }],
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
              {
                name: "details",
                type: { kind: "INPUT_OBJECT", name: "ProductDetails" },
              },
            ],
          },
          {
            kind: "INPUT_OBJECT",
            name: "ProductDetails",
            inputFields: [{ name: "quantity", type: { kind: "SCALAR", name: "Int" } }],
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
    expect(detail?.responseFields.map((row) => row.name)).toEqual(["token", "user"]);
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
    expect(detail?.requestInputTypes[0]?.fields.map((row) => row.name)).toEqual([
      "details",
      "ean",
    ]);
  });

  it("expande tipos aninhados de requisição e campos de resposta", () => {
    const detail = buildOperationSchemaDetail(
      operationSnapshot,
      "mutation",
      "createGroupedOrder",
      { includeNestedFields: true }
    );

    expect(detail?.requestInputTypes.map((section) => section.typeName)).toEqual([
      "ProductDetails",
      "ProductInput",
    ]);
    expect(detail?.requestInputTypes[0]?.fields.map((row) => row.name)).toEqual(["quantity"]);

    const token = buildOperationSchemaDetail(
      operationSnapshot,
      "mutation",
      "createToken",
      { includeNestedFields: true }
    );
    expect(token?.responseFields.map((row) => row.name)).toEqual(["token", "user", "user.name"]);
  });

  it("retorna null para operação inexistente", () => {
    expect(buildOperationSchemaDetail(operationSnapshot, "mutation", "inexistente")).toBeNull();
  });
});

describe("exemplos de requisição dos subprodutos Credenciado", () => {
  it("cobrem as operações do schema e mostram valores válidos para todas as variáveis", () => {
    for (const slug of [
      "credenciado-cadastro",
      "credenciado-optin",
      "credenciado-pbm-caixa",
      "credenciado-venda",
    ]) {
      const manual = JSON.parse(
        readFileSync(join(process.cwd(), "content", "projects", slug, "manual.json"), "utf8")
      );
      const snapshot = JSON.parse(
        readFileSync(join(process.cwd(), "data", "projects", slug, "schema.json"), "utf8")
      );
      const schema = buildClientSchema(snapshot.introspection);
      const operationNames = manual.operations.map((operation: { name: string }) => operation.name).sort();
      const schemaOperationNames = [
        ...Object.keys(schema.getQueryType()?.getFields() ?? {}),
        ...Object.keys(schema.getMutationType()?.getFields() ?? {}),
      ].sort();

      expect(operationNames, slug).toEqual(schemaOperationNames);

      for (const operation of manual.operations) {
        if (operation.name === "Prescription_addPrescription") {
          const payloadText = operation.exampleQuery.match(/operations: (.+)\n\nmap:/s)?.[1];
          expect(payloadText, operation.name).toBeTruthy();
          if (!payloadText) throw new Error("Payload multipart ausente");
          const payload = JSON.parse(payloadText);
          const uploadDocument = parse(payload.query);
          const uploadDefinition = uploadDocument.definitions.find(
            (definition) => definition.kind === Kind.OPERATION_DEFINITION
          );
          const uploadVariables = uploadDefinition?.kind === Kind.OPERATION_DEFINITION
            ? uploadDefinition.variableDefinitions?.map((definition) => definition.variable.name.value) ?? []
            : [];

          expect(payload.variables, operation.name).toEqual({ file: null });
          expect(Object.keys(payload.variables), operation.name).toEqual(uploadVariables);
          expect(operation.exampleQuery, operation.name).toContain("source: POINT_OF_SALES");
          expect(operation.exampleQuery, operation.name).toContain("prescriptionName");
          expect(operation.exampleQuery, operation.name).toContain("dateIssuance");
          continue;
        }

        const document = parse(operation.exampleQuery);
        expect(validate(schema, document).map((error) => error.message), operation.name).toEqual([]);
        const definition = document.definitions.find(
          (item) => item.kind === Kind.OPERATION_DEFINITION
        );
        expect(definition?.kind, operation.name).toBe(Kind.OPERATION_DEFINITION);
        if (definition?.kind !== Kind.OPERATION_DEFINITION) continue;

        const root = operation.kind === "query" ? schema.getQueryType() : schema.getMutationType();
        const field = definition.selectionSet.selections.find((item) => item.kind === Kind.FIELD);
        expect(field?.kind, operation.name).toBe(Kind.FIELD);
        if (field?.kind !== Kind.FIELD) continue;
        expect(
          (field.arguments ?? []).map((argument) => argument.name.value).sort(),
          operation.name
        ).toEqual(root?.getFields()[operation.name].args.map((argument) => argument.name).sort());

        const definitions = definition.variableDefinitions ?? [];
        if (!definitions.length) continue;
        expect(operation.exampleVariables, operation.name).toBeTruthy();
        const variables = JSON.parse(operation.exampleVariables);
        expect(Object.keys(variables).sort(), operation.name).toEqual(
          definitions.map((item) => item.variable.name.value).sort()
        );
        expect(getVariableValues(schema, definitions, variables).errors, operation.name).toBeUndefined();
      }
    }
  });
});
