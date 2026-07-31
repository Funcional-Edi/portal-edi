import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getContentMock, OctokitMock } = vi.hoisted(() => {
  const getContent = vi.fn();
  const Octokit = vi.fn(
    class {
      repos = { getContent };
    }
  );
  return {
    getContentMock: getContent,
    OctokitMock: Octokit,
  };
});

vi.mock("@octokit/rest", () => {
  return {
    Octokit: OctokitMock,
  };
});

import {
  listGithubFiles,
  listGithubSubdirs,
  readGithubJson,
  readGithubText,
} from "@/core/db/adapters/github-content-store";

const originalEnv = { ...process.env };

function toBase64(value: string): string {
  return Buffer.from(value, "utf8").toString("base64");
}

describe("github-content-store", () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GITHUB_REPO_OWNER: "acme",
      GITHUB_REPO_NAME: "cms",
      GITHUB_TOKEN: "token-123",
    };
    getContentMock.mockReset();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("lê JSON remoto e faz parse", async () => {
    getContentMock.mockResolvedValueOnce({
      data: {
        type: "file",
        encoding: "base64",
        content: toBase64('{"slug":"demo"}'),
      },
    });

    const result = await readGithubJson<{ slug: string }>("content/projects/demo/config.json");
    expect(result).toEqual({ slug: "demo" });
    expect(getContentMock).toHaveBeenCalledWith({
      owner: "acme",
      repo: "cms",
      path: "content/projects/demo/config.json",
    });
  });

  it("retorna null para arquivo inválido ou ausente", async () => {
    getContentMock.mockResolvedValueOnce({
      data: {
        type: "file",
        encoding: "base64",
        content: toBase64("{json quebrado"),
      },
    });
    expect(await readGithubJson("content/projects/demo/config.json")).toBeNull();

    getContentMock.mockRejectedValueOnce(new Error("404"));
    expect(await readGithubText("content/projects/demo/sections/intro.md")).toBeNull();
  });

  it("lista subpastas e arquivos de diretório remoto", async () => {
    getContentMock.mockResolvedValueOnce({
      data: [
        { type: "dir", name: "demo" },
        { type: "dir", name: "im" },
        { type: "file", name: "README.md" },
      ],
    });
    expect(await listGithubSubdirs("content/projects")).toEqual(["demo", "im"]);

    getContentMock.mockResolvedValueOnce({
      data: [
        { type: "file", name: "visao-geral.md" },
        { type: "file", name: "limites.md" },
        { type: "dir", name: "assets" },
      ],
    });
    expect(await listGithubFiles("content/projects/demo/sections")).toEqual([
      "visao-geral.md",
      "limites.md",
    ]);
  });
});
