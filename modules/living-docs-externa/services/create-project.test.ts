import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import { writeCatalogProduct } from "@/modules/living-docs-externa/repository/catalog-product-repository";
import { createProject } from "@/modules/living-docs-externa/services/create-project";
import { getProject } from "@/modules/living-docs-externa/repository/project-repository";

describe("createProject service", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-create-"));
    process.env.CONTENT_ROOT = tempRoot;
    revalidateTagMock.mockClear();
    await writeCatalogProduct({
      id: "trade",
      name: "Trade",
      description: "",
      order: 1,
      visible: true,
      status: "published",
      modules: [],
    });
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) {
      delete process.env.CONTENT_ROOT;
    } else {
      process.env.CONTENT_ROOT = originalContentRoot;
    }
    await rm(tempRoot, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    });
  });

  it("cria projeto com config e manual iniciais", async () => {
    const project = await createProject({
      slug: "test-im",
      name: "Test IM",
      description: "Projeto de teste",
      productId: "trade",
    });

    expect(project.config.slug).toBe("test-im");
    expect(project.config.productId).toBe("trade");
    expect(project.config.published).toBe(false);
    expect(project.manual.operations).toEqual([]);

    const loaded = await getProject("test-im");
    expect(loaded?.config.name).toBe("Test IM");
  });

  it("invalida tags de cache após criar", async () => {
    await createProject({ slug: "cache-test", name: "Cache Test", productId: "trade" });

    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:projects");
    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:cache-test");
  });

  it("rejeita slug duplicado", async () => {
    await createProject({ slug: "dup", name: "Primeiro", productId: "trade" });

    await expect(createProject({ slug: "dup", name: "Segundo", productId: "trade" })).rejects.toMatchObject({
      code: "ALREADY_EXISTS",
    });
  });

  it("normaliza slug com maiúsculas, espaços e underscore", async () => {
    const project = await createProject({ slug: "EDI_Canais Teste", name: "X", productId: "trade" });
    expect(project.config.slug).toBe("edi-canais-teste");
  });

  it("rejeita slug inválido após normalização", async () => {
    await expect(createProject({ slug: "!!!", name: "X", productId: "trade" })).rejects.toMatchObject({
      code: "VALIDATION",
    });
    await expect(createProject({ slug: "a", name: "X", productId: "trade" })).rejects.toMatchObject({
      code: "VALIDATION",
    });
  });

  it("exige um produto do menu de documentação", async () => {
    await expect(createProject({ slug: "sem-produto", name: "X" })).rejects.toMatchObject({
      code: "VALIDATION",
    });
    await expect(
      createProject({ slug: "produto-invalido", name: "X", productId: "edi-pharma" }),
    ).rejects.toMatchObject({ code: "PRODUCT_NOT_FOUND" });
  });
});
