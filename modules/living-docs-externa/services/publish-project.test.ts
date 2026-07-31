import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import { createProject, getProject } from "@/modules/living-docs-externa/repository/project-repository";
import { PublishProjectError, setProjectPublished } from "@/modules/living-docs-externa/services/publish-project";

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

    await rm(tempRoot, { recursive: true, force: true });
  });

  it("publica um projeto: seta published e manualStatus, invalida cache", async () => {
    const config = await setProjectPublished("demo", { published: true });

    expect(config.published).toBe(true);
    expect(config.manualStatus).toBe("published");

    const loaded = await getProject("demo");
    expect(loaded?.config.published).toBe(true);

    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:projects");
    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
  });

  it("despublica um projeto: volta manualStatus para draft", async () => {
    await setProjectPublished("demo", { published: true });
    revalidateTagMock.mockClear();

    const config = await setProjectPublished("demo", { published: false });

    expect(config.published).toBe(false);
    expect(config.manualStatus).toBe("draft");
    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
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
