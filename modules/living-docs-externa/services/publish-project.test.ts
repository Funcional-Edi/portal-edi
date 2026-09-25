import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import { createProject, getProject, writeManual } from "@/modules/living-docs-externa/repository/project-repository";
import { writeManualSection } from "@/modules/living-docs-externa/repository/section-repository";
import { PublishProjectError, setProjectPublished } from "@/modules/living-docs-externa/services/publish-project";

/** Deixa o projeto `demo` aprovado no checklist de qualidade (etapa 6.5). */
async function makePublishable(): Promise<void> {
  await writeManual("demo", {
    version: 1,
    title: "Integração Demo",
    productName: "Demo Gateway",
    operations: [
      {
        kind: "query",
        name: "listItems",
        order: 1,
        description: "Lista os itens disponíveis no gateway.",
        exampleQuery: "query listItems { listItems { id } }",
      },
    ],
  });
  await writeManualSection(
    "demo",
    "visao-geral",
    "# Visão geral\n\nEste manual descreve a integração de demonstração usada nos testes automatizados do portal.\n"
  );
}

describe("publishProject service", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-publish-"));
    process.env.CONTENT_ROOT = tempRoot;
    revalidateTagMock.mockClear();

    await createProject({ slug: "demo", name: "Demo" });
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;

    await rm(tempRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  });

  it("publica um projeto: seta published e manualStatus, invalida cache", async () => {
    await makePublishable();

    const config = await setProjectPublished("demo", { published: true });

    expect(config.published).toBe(true);
    expect(config.manualStatus).toBe("published");

    const loaded = await getProject("demo");
    expect(loaded?.config.published).toBe(true);

    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:projects");
    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
  });

  it("despublica um projeto: volta manualStatus para draft", async () => {
    await makePublishable();
    await setProjectPublished("demo", { published: true });
    revalidateTagMock.mockClear();

    const config = await setProjectPublished("demo", { published: false });

    expect(config.published).toBe(false);
    expect(config.manualStatus).toBe("draft");
    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
  });

  it("bloqueia publicação quando o checklist de qualidade reprova", async () => {
    await expect(setProjectPublished("demo", { published: true })).rejects.toMatchObject({
      code: "QUALITY_GATE",
    });

    const loaded = await getProject("demo");
    expect(loaded?.config.published).toBe(false);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("anexa o relatório de qualidade ao erro para o editor listar pendências", async () => {
    const error = await setProjectPublished("demo", { published: true }).catch((e) => e);

    expect(error).toBeInstanceOf(PublishProjectError);
    expect((error as PublishProjectError).report?.readyToPublish).toBe(false);
    expect((error as PublishProjectError).report?.failed).toBeGreaterThan(0);
  });

  it("despublicar nunca é bloqueado pelo checklist", async () => {
    const config = await setProjectPublished("demo", { published: false });
    expect(config.published).toBe(false);
  });

  it("rejeita entrada inválida sem persistir nem invalidar cache", async () => {
    await expect(setProjectPublished("demo", { published: "sim" })).rejects.toMatchObject({
      code: "VALIDATION",
    });
    expect(revalidateTagMock).not.toHaveBeenCalled();

    const loaded = await getProject("demo");
    expect(loaded?.config.published).toBe(false);
  });

  it("rejeita projeto inexistente", async () => {
    await expect(setProjectPublished("nao-existe", { published: true })).rejects.toBeInstanceOf(
      PublishProjectError
    );
    await expect(setProjectPublished("nao-existe", { published: true })).rejects.toMatchObject({
      code: "PROJECT_NOT_FOUND",
    });
  });
});
