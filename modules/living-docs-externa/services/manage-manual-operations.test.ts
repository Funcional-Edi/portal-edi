import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import { createProject, getManual } from "@/modules/living-docs-externa/repository/project-repository";
import {
  ManageOperationError,
  addManualOperation,
  removeManualOperation,
  updateManualOperation,
} from "@/modules/living-docs-externa/services/manage-manual-operations";

describe("manage-manual-operations service", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-manual-ops-"));
    process.env.CONTENT_ROOT = tempRoot;
    revalidateTagMock.mockClear();

    await createProject({ slug: "demo", name: "Demo" });
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;

    await rm(tempRoot, { recursive: true, force: true });
  });

  describe("addManualOperation", () => {
    it("adiciona operação com order auto-atribuído e invalida cache", async () => {
      const operation = await addManualOperation("demo", {
        kind: "query",
        name: "listItems",
        title: "Listar itens",
      });

      expect(operation.order).toBe(1);

      const manual = await getManual("demo");
      expect(manual?.operations).toHaveLength(1);
      expect(manual?.operations[0]).toMatchObject({ kind: "query", name: "listItems" });

      expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:projects");
      expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
    });

    it("incrementa order automaticamente a partir do maior existente", async () => {
      await addManualOperation("demo", { kind: "query", name: "a", order: 5 });
      const second = await addManualOperation("demo", { kind: "query", name: "b" });
      expect(second.order).toBe(6);
    });

    it("respeita order explícito quando informado", async () => {
      const operation = await addManualOperation("demo", {
        kind: "mutation",
        name: "createItem",
        order: 3,
      });
      expect(operation.order).toBe(3);
    });

    it("rejeita entrada inválida", async () => {
      await expect(
        addManualOperation("demo", { kind: "invalid-kind", name: "x" })
      ).rejects.toMatchObject({ code: "VALIDATION" });
    });

    it("rejeita operação duplicada (mesmo kind+name)", async () => {
      await addManualOperation("demo", { kind: "query", name: "dup" });

      await expect(addManualOperation("demo", { kind: "query", name: "dup" })).rejects.toMatchObject({
        code: "OPERATION_ALREADY_EXISTS",
      });
    });

    it("rejeita projeto inexistente", async () => {
      await expect(
        addManualOperation("nao-existe", { kind: "query", name: "x" })
      ).rejects.toMatchObject({ code: "PROJECT_NOT_FOUND" });
    });
  });

  describe("updateManualOperation", () => {
    it("atualiza os campos principais mantendo kind+name", async () => {
      await addManualOperation("demo", { kind: "query", name: "listItems", order: 1 });

      const updated = await updateManualOperation("demo", "query", "listItems", {
        order: 1,
        title: "Listar itens (atualizado)",
        description: "Nova descrição",
        businessNotes: ["nota 1", "nota 2"],
      });

      expect(updated.title).toBe("Listar itens (atualizado)");
      expect(updated.businessNotes).toEqual(["nota 1", "nota 2"]);

      const manual = await getManual("demo");
      expect(manual?.operations[0].description).toBe("Nova descrição");
    });

    it("rejeita entrada inválida", async () => {
      await addManualOperation("demo", { kind: "query", name: "listItems", order: 1 });

      await expect(
        updateManualOperation("demo", "query", "listItems", { order: -1 })
      ).rejects.toMatchObject({ code: "VALIDATION" });
    });

    it("rejeita operação inexistente", async () => {
      await expect(
        updateManualOperation("demo", "query", "naoExiste", { order: 1 })
      ).rejects.toMatchObject({ code: "OPERATION_NOT_FOUND" });
    });

    it("rejeita projeto inexistente", async () => {
      await expect(
        updateManualOperation("nao-existe", "query", "x", { order: 1 })
      ).rejects.toMatchObject({ code: "PROJECT_NOT_FOUND" });
    });
  });

  describe("removeManualOperation", () => {
    it("remove a operação do manual e invalida cache", async () => {
      await addManualOperation("demo", { kind: "query", name: "listItems", order: 1 });
      revalidateTagMock.mockClear();

      await removeManualOperation("demo", "query", "listItems");

      const manual = await getManual("demo");
      expect(manual?.operations).toHaveLength(0);
      expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
    });

    it("rejeita operação inexistente", async () => {
      await expect(removeManualOperation("demo", "query", "naoExiste")).rejects.toMatchObject({
        code: "OPERATION_NOT_FOUND",
      });
    });

    it("rejeita projeto inexistente", async () => {
      await expect(removeManualOperation("nao-existe", "query", "x")).rejects.toBeInstanceOf(
        ManageOperationError
      );
    });
  });
});
