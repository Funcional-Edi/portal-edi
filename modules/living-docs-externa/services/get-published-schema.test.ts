import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const { getContentBackendMock } = vi.hoisted(() => ({
  getContentBackendMock: vi.fn(() => "local"),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (loader: () => Promise<unknown>) => loader,
}));

vi.mock("@/core/db/adapters", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/core/db/adapters")>();
  return {
    ...actual,
    getContentBackend: getContentBackendMock,
  };
});

import { writeProjectSchemaSnapshot } from "@/modules/living-docs-externa/repository/schema-repository";
import {
  getPublishedSchemaReference,
  hasPublishedSchemaSnapshot,
  listPublishedSchemaCatalog,
} from "@/modules/living-docs-externa/services/get-published-schema";

describe("get-published-schema services", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-schema-ref-"));
    process.env.CONTENT_ROOT = tempRoot;
    getContentBackendMock.mockReturnValue("local");

    const { cp } = await import("node:fs/promises");
    await cp(path.join(process.cwd(), "content"), path.join(tempRoot, "content"), {
      recursive: true,
    });
    await cp(path.join(process.cwd(), "data"), path.join(tempRoot, "data"), {
      recursive: true,
    });
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;
    await rm(tempRoot, { recursive: true, force: true });
  });

  it("lista catálogo com flag hasSchema para projetos publicados", async () => {
    const catalog = await listPublishedSchemaCatalog();
    const im = catalog.find((entry) => entry.slug === "im");
    const demo = catalog.find((entry) => entry.slug === "demo");
    const wholesaler = catalog.find((entry) => entry.slug === "wholesaler");

    expect(im?.hasSchema).toBe(true);
    expect(im?.queryFieldCount).toBe(2);
    expect(demo?.hasSchema).toBe(true);
    expect(wholesaler?.hasSchema).toBe(false);
  });

  it("hasPublishedSchemaSnapshot retorna true/false conforme snapshot", async () => {
    expect(await hasPublishedSchemaSnapshot("im")).toBe(true);
    expect(await hasPublishedSchemaSnapshot("wholesaler")).toBe(false);
  });

  it("retorna referência publicada com snapshot e visão derivada", async () => {
    const result = await getPublishedSchemaReference("im");
    expect(result).not.toBeNull();
    expect(result?.project.config.slug).toBe("im");
    expect(result?.reference.mutations.map((m) => m.name)).toContain("createToken");
  });

  it("retorna null para projeto publicado sem snapshot de schema", async () => {
    const result = await getPublishedSchemaReference("wholesaler");
    expect(result).toBeNull();
  });

  it("retorna null para slug inexistente", async () => {
    const result = await getPublishedSchemaReference("nao-existe");
    expect(result).toBeNull();
  });

  it("ignora snapshot órfão quando projeto não está publicado", async () => {
    await writeProjectSchemaSnapshot("draft-only", {
      version: 1,
      syncedAt: "2026-08-31T12:00:00.000Z",
      source: {
        projectSlug: "draft-only",
        graphqlUrl: "https://gateway.example/graphql",
      },
      introspection: {
        __schema: {
          queryType: { name: "Query" },
          mutationType: null,
          types: [{ kind: "OBJECT", name: "Query", fields: [] }],
        },
      },
      summary: { typeCount: 1, queryFieldCount: 0, mutationFieldCount: 0 },
    });

    const result = await getPublishedSchemaReference("draft-only");
    expect(result).toBeNull();
  });
});
