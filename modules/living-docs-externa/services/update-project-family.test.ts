import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import { createProject, getProject } from "@/modules/living-docs-externa/repository/project-repository";
import {
  UpdateProjectFamilyError,
  setProjectFamily,
} from "@/modules/living-docs-externa/services/update-project-family";

describe("setProjectFamily service", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-family-"));
    process.env.CONTENT_ROOT = tempRoot;
    revalidateTagMock.mockClear();

    await createProject({ slug: "demo", name: "Demo" });
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;

    await rm(tempRoot, { recursive: true, force: true });
  });

  it("reclassifica a família de um projeto existente e invalida cache", async () => {
    const config = await setProjectFamily("demo", { family: "edi-varejo" });

    expect(config.family).toBe("edi-varejo");

    const loaded = await getProject("demo");
    expect(loaded?.config.family).toBe("edi-varejo");

    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:projects");
    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
  });

  it("permite reclassificar mais de uma vez", async () => {
    await setProjectFamily("demo", { family: "edi-varejo" });
    const config = await setProjectFamily("demo", { family: "edi-pharma" });

    expect(config.family).toBe("edi-pharma");
  });

  it("rejeita entrada inválida sem persistir nem invalidar cache", async () => {
    await expect(setProjectFamily("demo", { family: "nao-existe" })).rejects.toMatchObject({
      code: "VALIDATION",
    });
    expect(revalidateTagMock).not.toHaveBeenCalled();

    const loaded = await getProject("demo");
    expect(loaded?.config.family).toBeUndefined();
  });

  it("rejeita projeto inexistente", async () => {
    await expect(setProjectFamily("nao-existe", { family: "edi-pharma" })).rejects.toBeInstanceOf(
      UpdateProjectFamilyError
    );
    await expect(setProjectFamily("nao-existe", { family: "edi-pharma" })).rejects.toMatchObject({
      code: "PROJECT_NOT_FOUND",
    });
  });
});
