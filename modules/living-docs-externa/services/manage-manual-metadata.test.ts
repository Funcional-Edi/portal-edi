import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import { createProject, getManual } from "@/modules/living-docs-externa/repository/project-repository";
import { addManualOperation } from "@/modules/living-docs-externa/services/manage-manual-operations";
import { updateManualMetadata } from "@/modules/living-docs-externa/services/manage-manual-metadata";

describe("manage-manual-metadata service", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-manual-metadata-"));
    process.env.CONTENT_ROOT = tempRoot;
    revalidateTagMock.mockClear();

    await createProject({ slug: "demo", name: "Demo" });
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;

    await rm(tempRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  });

  it("atualiza título, produto e versão e invalida cache", async () => {
    const manual = await updateManualMetadata("demo", {
      title: "Integração Demo",
      productName: "Demo Gateway",
      manualVersion: "1.0.0",
    });

    expect(manual.title).toBe("Integração Demo");

    const stored = await getManual("demo");
    expect(stored?.productName).toBe("Demo Gateway");
    expect(stored?.manualVersion).toBe("1.0.0");

    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:projects");
    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
  });

  it("preserva as operações já cadastradas", async () => {
    await addManualOperation("demo", { kind: "query", name: "listItems" });

    await updateManualMetadata("demo", { title: "Integração Demo" });

    const stored = await getManual("demo");
    expect(stored?.operations).toHaveLength(1);
    expect(stored?.operations[0].name).toBe("listItems");
  });

  it("limpa produto e versão quando omitidos", async () => {
    await updateManualMetadata("demo", {
      title: "Integração Demo",
      productName: "Demo Gateway",
      manualVersion: "1.0.0",
    });

    await updateManualMetadata("demo", { title: "Integração Demo" });

    const stored = await getManual("demo");
    expect(stored?.productName).toBeUndefined();
    expect(stored?.manualVersion).toBeUndefined();
  });

  it("rejeita título vazio", async () => {
    await expect(updateManualMetadata("demo", { title: "" })).rejects.toMatchObject({
      code: "VALIDATION",
    });
  });

  it("rejeita projeto inexistente", async () => {
    await expect(
      updateManualMetadata("nao-existe", { title: "Integração" })
    ).rejects.toMatchObject({ code: "PROJECT_NOT_FOUND" });
  });
});
