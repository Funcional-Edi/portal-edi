import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
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

const publishedWithoutSchemaSlug = "published-without-schema";

async function createPublishedProjectWithoutSchema(root: string): Promise<void> {
  const projectRoot = path.join(root, "content", "projects", publishedWithoutSchemaSlug);

  await mkdir(projectRoot, { recursive: true });
  await writeFile(
    path.join(projectRoot, "config.json"),
    `${JSON.stringify(
      {
        slug: publishedWithoutSchemaSlug,
        name: "Published Without Schema",
        description: "Published GraphQL project without a schema snapshot.",
        family: "edi-pharma",
        protocol: "graphql",
        environment: "homolog",
        graphqlUrl: "https://gateway.example/graphql",
        gatewaySlug: "gateway-without-schema",
        published: true,
        audience: "distribuidor",
        manualStatus: "published",
        createdAt: "2026-08-31T12:00:00.000Z",
        updatedAt: "2026-08-31T12:00:00.000Z",
      },
      null,
      2
    )}\n`
  );
  await writeFile(
    path.join(projectRoot, "manual.json"),
    `${JSON.stringify(
      {
        version: 1,
        title: "Published Without Schema",
        productName: "Published Without Schema",
        manualVersion: "1.0.0",
        operations: [],
      },
      null,
      2
    )}\n`
  );
}

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
    await createPublishedProjectWithoutSchema(tempRoot);
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

  it("indexa produto publicado com snapshot", async () => {
    const { buildSchemaSearchIndex } = await import(
      "@/modules/living-docs-externa/services/build-schema-search-index"
    );

    const entries = await buildSchemaSearchIndex();
    expect(entries.some((entry) => entry.keywords.includes("wholesaler"))).toBe(true);
  });

  it("nao indexa produto publicado sem snapshot", async () => {
    const { buildSchemaSearchIndex } = await import(
      "@/modules/living-docs-externa/services/build-schema-search-index"
    );

    const entries = await buildSchemaSearchIndex();
    expect(entries.some((entry) => entry.keywords.includes(publishedWithoutSchemaSlug))).toBe(false);
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
    const tokenPayloadResults = results.filter(
      (r) => r.type === "schema-type" && r.title === "TokenPayload"
    );
    // `TokenPayload` é um nome de tipo comum a mais de um gateway publicado
    // (ex.: im, canal-autorizador) — a asserção não deve depender de qual
    // produto aparece primeiro, só de o link apontar para um schema válido.
    expect(tokenPayloadResults.length).toBeGreaterThan(0);
    expect(
      tokenPayloadResults.every((r) => /\/docs\/api\/[a-z0-9-]+\/types\/TokenPayload/.test(r.href))
    ).toBe(true);
  });
});
