import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
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
  getPublishedSchemaTypeDetail,
  hasPublishedSchemaSnapshot,
  listPublishedSchemaCatalog,
} from "@/modules/living-docs-externa/services/get-published-schema";

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
    await createPublishedProjectWithoutSchema(tempRoot);
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
    const withoutSchema = catalog.find((entry) => entry.slug === publishedWithoutSchemaSlug);

    expect(im?.hasSchema).toBe(true);
    expect(im?.queryFieldCount).toBe(2);
    expect(demo?.hasSchema).toBe(true);
    expect(wholesaler?.hasSchema).toBe(true);
    expect(wholesaler?.typeCount).toBeGreaterThan(0);
    expect(withoutSchema?.hasSchema).toBe(false);
  });

  it("hasPublishedSchemaSnapshot retorna true/false conforme snapshot", async () => {
    expect(await hasPublishedSchemaSnapshot("im")).toBe(true);
    expect(await hasPublishedSchemaSnapshot("wholesaler")).toBe(true);
    expect(await hasPublishedSchemaSnapshot(publishedWithoutSchemaSlug)).toBe(false);
  });

  it("retorna referência publicada com snapshot e visão derivada", async () => {
    const result = await getPublishedSchemaReference("im");
    expect(result).not.toBeNull();
    expect(result?.project.config.slug).toBe("im");
    expect(result?.reference.mutations.map((m) => m.name)).toContain("createToken");
  });

  it("retorna referencia publicada para wholesaler com snapshot", async () => {
    const result = await getPublishedSchemaReference("wholesaler");

    expect(result).not.toBeNull();
    expect(result?.project.config.slug).toBe("wholesaler");
    expect(result?.snapshot).toBeDefined();
    expect(result?.snapshot.source.projectSlug).toBe("wholesaler");
    expect(result?.reference).toBeDefined();
  });

  it("retorna null para projeto publicado sem snapshot de schema", async () => {
    const result = await getPublishedSchemaReference(publishedWithoutSchemaSlug);
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

  it("retorna detalhe de tipo publicado com campos e args", async () => {
    const result = await getPublishedSchemaTypeDetail("im", "Mutation");
    expect(result).not.toBeNull();
    expect(result?.typeDetail.name).toBe("Mutation");
    expect(result?.typeDetail.fields?.some((f) => f.name === "createToken")).toBe(true);
    const createToken = result?.typeDetail.fields?.find((f) => f.name === "createToken");
    expect(createToken?.args.map((a) => a.name)).toEqual(["login", "password"]);
    expect(createToken?.returnType.namedType).toBe("TokenPayload");
  });

  it("retorna null para tipo inexistente ou produto sem schema", async () => {
    expect(await getPublishedSchemaTypeDetail("im", "TipoInexistente")).toBeNull();
    expect(await getPublishedSchemaTypeDetail(publishedWithoutSchemaSlug, "Query")).toBeNull();
    expect(await getPublishedSchemaTypeDetail("nao-existe", "Query")).toBeNull();
  });
});
