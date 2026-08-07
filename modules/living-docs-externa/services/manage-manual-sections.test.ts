import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import { createProject } from "@/modules/living-docs-externa/repository/project-repository";
import { listManualSections } from "@/modules/living-docs-externa/repository/section-repository";
import {
  ManageSectionError,
  addManualSection,
  listDraftManualSections,
  removeManualSection,
  updateManualSectionBody,
} from "@/modules/living-docs-externa/services/manage-manual-sections";

describe("manage-manual-sections service", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-manual-sections-"));
    process.env.CONTENT_ROOT = tempRoot;
    revalidateTagMock.mockClear();

    await createProject({ slug: "demo", name: "Demo" });
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;

    await rm(tempRoot, { recursive: true, force: true });
  });

  describe("addManualSection", () => {
    it("cria a seção com esqueleto Markdown e invalida cache", async () => {
      const section = await addManualSection("demo", {
        id: "visao-geral",
        title: "Visão geral",
      });

      expect(section.id).toBe("visao-geral");
      expect(section.title).toBe("Visão geral");
      expect(section.body).toContain("# Visão geral");

      const stored = await listManualSections("demo");
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe("visao-geral");

      expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:projects");
      expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
    });

    it("usa o body informado quando presente", async () => {
      const section = await addManualSection("demo", {
        id: "limites",
        body: "# Limites\n\nMáximo de 500 itens por requisição.\n",
      });

      expect(section.body).toContain("500 itens");
      expect(section.title).toBe("Limites");
    });

    it("rejeita id fora do padrão de nome de arquivo", async () => {
      await expect(
        addManualSection("demo", { id: "Visão Geral", title: "x" })
      ).rejects.toMatchObject({ code: "VALIDATION" });
    });

    it("rejeita seção duplicada", async () => {
      await addManualSection("demo", { id: "visao-geral", title: "Visão geral" });

      await expect(
        addManualSection("demo", { id: "visao-geral", title: "Outra" })
      ).rejects.toMatchObject({ code: "SECTION_ALREADY_EXISTS" });
    });

    it("rejeita projeto inexistente", async () => {
      await expect(
        addManualSection("nao-existe", { id: "visao-geral" })
      ).rejects.toMatchObject({ code: "PROJECT_NOT_FOUND" });
    });
  });

  describe("updateManualSectionBody", () => {
    it("sobrescreve o Markdown e recalcula o título", async () => {
      await addManualSection("demo", { id: "visao-geral", title: "Visão geral" });
      revalidateTagMock.mockClear();

      const updated = await updateManualSectionBody("demo", "visao-geral", {
        body: "# Panorama\n\nConteúdo revisado pelo time EDI.\n",
      });

      expect(updated.title).toBe("Panorama");
      expect(updated.body).toContain("revisado pelo time EDI");

      const stored = await listManualSections("demo");
      expect(stored[0].title).toBe("Panorama");
      expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
    });

    it("rejeita body vazio", async () => {
      await addManualSection("demo", { id: "visao-geral" });

      await expect(
        updateManualSectionBody("demo", "visao-geral", { body: "" })
      ).rejects.toMatchObject({ code: "VALIDATION" });
    });

    it("rejeita id com path traversal antes de tocar o filesystem", async () => {
      await expect(
        updateManualSectionBody("demo", "../../config", { body: "hack" })
      ).rejects.toMatchObject({ code: "VALIDATION" });
    });

    it("rejeita seção inexistente", async () => {
      await expect(
        updateManualSectionBody("demo", "nao-existe", { body: "# x\n" })
      ).rejects.toMatchObject({ code: "SECTION_NOT_FOUND" });
    });
  });

  describe("removeManualSection", () => {
    it("apaga o arquivo .md e invalida cache", async () => {
      await addManualSection("demo", { id: "visao-geral" });
      revalidateTagMock.mockClear();

      await removeManualSection("demo", "visao-geral");

      expect(await listManualSections("demo")).toHaveLength(0);
      expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
    });

    it("rejeita seção inexistente", async () => {
      await expect(removeManualSection("demo", "nao-existe")).rejects.toBeInstanceOf(
        ManageSectionError
      );
    });
  });

  describe("listDraftManualSections", () => {
    it("lista seções de rascunho (sem gate de published)", async () => {
      await addManualSection("demo", { id: "visao-geral", title: "Visão geral" });
      await addManualSection("demo", { id: "limites", title: "Limites" });

      const sections = await listDraftManualSections("demo");

      expect(sections.map((section) => section.id)).toEqual(["limites", "visao-geral"]);
    });

    it("rejeita projeto inexistente", async () => {
      await expect(listDraftManualSections("nao-existe")).rejects.toMatchObject({
        code: "PROJECT_NOT_FOUND",
      });
    });
  });
});
