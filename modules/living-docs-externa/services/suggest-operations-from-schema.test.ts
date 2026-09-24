import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createProject, writeManual } from "@/modules/living-docs-externa/repository/project-repository";
import { writeProjectSchemaSnapshot } from "@/modules/living-docs-externa/repository/schema-repository";
import type { ProjectSchemaSnapshot } from "@/modules/living-docs-externa/schema/introspection";
import { getSuggestedOperations } from "@/modules/living-docs-externa/services/suggest-operations-from-schema";

const snapshot: ProjectSchemaSnapshot = {
  version: 1,
  syncedAt: "2026-09-01T10:00:00.000Z",
  source: { projectSlug: "demo", graphqlUrl: "https://gateway.example.com/graphql" },
  summary: { typeCount: 3, queryFieldCount: 1, mutationFieldCount: 1 },
  introspection: {
    __schema: {
      queryType: { name: "Query" },
      mutationType: { name: "Mutation" },
      types: [
        {
          kind: "OBJECT",
          name: "Query",
          fields: [
            {
              name: "groupedOrder",
              description: "Consulta um pedido pelo id.",
              args: [
                {
                  name: "id",
                  type: { kind: "NON_NULL", ofType: { kind: "SCALAR", name: "Int" } },
                },
              ],
              type: { kind: "OBJECT", name: "GroupedOrder" },
            },
          ],
        },
        {
          kind: "OBJECT",
          name: "Mutation",
          fields: [
            {
              name: "createGroupedOrder",
              args: [
                {
                  name: "products",
                  type: {
                    kind: "LIST",
                    ofType: { kind: "NON_NULL", ofType: { kind: "INPUT_OBJECT", name: "ProductInput" } },
                  },
                },
              ],
              type: { kind: "OBJECT", name: "GroupedOrder" },
            },
          ],
        },
        {
          kind: "OBJECT",
          name: "GroupedOrder",
          fields: [
            { name: "id", type: { kind: "SCALAR", name: "Int" } },
            { name: "status", type: { kind: "SCALAR", name: "String" } },
          ],
        },
        {
          kind: "INPUT_OBJECT",
          name: "ProductInput",
          inputFields: [
            { name: "ean", type: { kind: "NON_NULL", ofType: { kind: "SCALAR", name: "String" } } },
            { name: "ordered_quantity", type: { kind: "SCALAR", name: "Int" } },
          ],
        },
      ],
    },
  },
};

describe("suggest-operations-from-schema service", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-suggest-ops-"));
    process.env.CONTENT_ROOT = tempRoot;
    await createProject({ slug: "demo", name: "Demo" });
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;
    await rm(tempRoot, { recursive: true, force: true });
  });

  it("hasSchema: false quando o projeto nunca sincronizou", async () => {
    const result = await getSuggestedOperations("demo");
    expect(result).toEqual({ hasSchema: false, suggestions: [] });
  });

  it("sugere uma operação por campo raiz descoberto, com título e exemplo montados", async () => {
    await writeProjectSchemaSnapshot("demo", snapshot);

    const result = await getSuggestedOperations("demo");

    expect(result.hasSchema).toBe(true);
    expect(result.suggestions).toHaveLength(2);

    const query = result.suggestions.find((s) => s.name === "groupedOrder")!;
    expect(query.kind).toBe("query");
    expect(query.alreadyAdded).toBe(false);
    expect(query.schemaDescription).toBe("Consulta um pedido pelo id.");
    expect(query.draft.title).toBe("Grouped order");
    expect(query.draft.exampleQuery).toBe(
      "query groupedOrder {\n  groupedOrder(\n    id: 0\n  ) {\n    id\n    status\n  }\n}"
    );

    const mutation = result.suggestions.find((s) => s.name === "createGroupedOrder")!;
    expect(mutation.kind).toBe("mutation");
    expect(mutation.draft.exampleQuery).toBe(
      'mutation createGroupedOrder {\n  createGroupedOrder(\n    products: [{ ean: "", ordered_quantity: 0 }]\n  ) {\n    id\n    status\n  }\n}'
    );
  });

  it("marca alreadyAdded quando a operação já está no manual.json", async () => {
    await writeProjectSchemaSnapshot("demo", snapshot);
    await writeManual("demo", {
      version: 1,
      title: "Integração Demo",
      operations: [{ kind: "query", name: "groupedOrder", order: 1 }],
    });

    const result = await getSuggestedOperations("demo");

    const query = result.suggestions.find((s) => s.name === "groupedOrder")!;
    expect(query.alreadyAdded).toBe(true);
    const mutation = result.suggestions.find((s) => s.name === "createGroupedOrder")!;
    expect(mutation.alreadyAdded).toBe(false);
  });
});
