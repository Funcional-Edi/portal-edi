import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { searchIndex } from "@/core/search/fuse-search";

const { getContentBackendMock } = vi.hoisted(() => ({
  getContentBackendMock: vi.fn(() => "local"),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (loader: () => Promise<unknown>) => loader,
  cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("@/core/db/adapters", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/core/db/adapters")>();
  return {
    ...actual,
    getContentBackend: getContentBackendMock,
  };
});

describe("buildSchemaSearchIndex", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-schema-search-"));
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

  it("indexa queries, mutations e tipos de produtos publicados com schema", async () => {
    const { buildSchemaSearchIndex } = await import(
      "@/modules/living-docs-externa/services/build-schema-search-index"
    );

    const entries = await buildSchemaSearchIndex();
    expect(entries.some((e) => e.type === "schema-field" && e.title === "createToken")).toBe(
      true
    );
    expect(entries.some((e) => e.type === "schema-field" && e.title === "health")).toBe(true);
    expect(entries.some((e) => e.type === "schema-type" && e.title === "TokenPayload")).toBe(
      true
    );
    expect(entries.every((e) => e.href.startsWith("/docs/api/"))).toBe(true);
  });

  it("nao indexa produto publicado sem snapshot (wholesaler)", async () => {
    const { buildSchemaSearchIndex } = await import(
      "@/modules/living-docs-externa/services/build-schema-search-index"
    );

    const entries = await buildSchemaSearchIndex();
    expect(entries.some((e) => e.keywords.includes("wholesaler"))).toBe(false);
  });

  it("integra com searchIndex por nome de tipo GraphQL", async () => {
    const { buildSchemaSearchIndex } = await import(
      "@/modules/living-docs-externa/services/build-schema-search-index"
    );
    const { buildLivingDocsSearchIndex } = await import(
      "@/modules/living-docs-externa/services/build-search-index"
    );

    const [manualEntries, schemaEntries] = await Promise.all([
      buildLivingDocsSearchIndex(false),
      buildSchemaSearchIndex(),
    ]);

    const results = searchIndex([...manualEntries, ...schemaEntries], "TokenPayload");
    expect(results.some((r) => r.type === "schema-type" && r.title === "TokenPayload")).toBe(
      true
    );
    expect(results.find((r) => r.type === "schema-type")?.href).toMatch(
      /\/docs\/api\/im\/types\/TokenPayload/
    );
  });
});
