import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getContentMock, gitMock, OctokitMock } = vi.hoisted(() => {
  const getContent = vi.fn();
  const git = {
    getRef: vi.fn(),
    createBlob: vi.fn(),
    createTree: vi.fn(),
    createCommit: vi.fn(),
    updateRef: vi.fn(),
  };
  const Octokit = vi.fn(
    class {
      repos = { getContent };
      git = git;
    }
  );
  return {
    getContentMock: getContent,
    gitMock: git,
    OctokitMock: Octokit,
  };
});

vi.mock("@octokit/rest", () => {
  return {
    Octokit: OctokitMock,
  };
});

import { GithubContentError } from "@/core/db/adapters/github-content-error";
import {
  deleteGithubFile,
  listGithubFiles,
  listGithubSubdirs,
  readGithubJson,
  readGithubText,
  writeGithubFilesAtomic,
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
      GITHUB_WRITE_TOKEN: "write-token-456",
    };
    getContentMock.mockReset();
    Object.values(gitMock).forEach((m) => m.mockReset());
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
        { type: "dir", name: "wholesaler" },
        { type: "file", name: "README.md" },
      ],
    });
    expect(await listGithubSubdirs("content/projects")).toEqual(["demo", "wholesaler"]);

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

  it("lê com ref (branch ou SHA) quando informado", async () => {
    getContentMock.mockResolvedValueOnce({
      data: { type: "file", encoding: "base64", content: toBase64("oi") },
    });
    expect(await readGithubText("content/a.md", "edi-1")).toBe("oi");
    expect(getContentMock).toHaveBeenCalledWith({
      owner: "acme",
      repo: "cms",
      path: "content/a.md",
      ref: "edi-1",
    });
  });

  describe("escrita atômica", () => {
    function mockHappyPath() {
      gitMock.getRef.mockResolvedValue({ data: { object: { sha: "parent" } } });
      gitMock.createBlob.mockResolvedValue({ data: { sha: "blob1" } });
      gitMock.createTree.mockResolvedValue({ data: { sha: "tree1" } });
      gitMock.createCommit.mockResolvedValue({ data: { sha: "commit1" } });
      gitMock.updateRef.mockResolvedValue({});
    }

    it("blob -> tree -> commit -> updateRef sem force", async () => {
      mockHappyPath();
      await writeGithubFilesAtomic({
        branch: "edi-1",
        message: "feat: x\nsegredo",
        files: [{ path: "/content/a.md", content: "olá" }],
      });
      expect(gitMock.getRef).toHaveBeenCalledWith(
        expect.objectContaining({ ref: "heads/edi-1" })
      );
      expect(gitMock.createBlob).toHaveBeenCalledWith(
        expect.objectContaining({ content: toBase64("olá"), encoding: "base64" })
      );
      expect(gitMock.createTree).toHaveBeenCalledWith(
        expect.objectContaining({
          base_tree: "parent",
          tree: [{ path: "content/a.md", mode: "100644", type: "blob", sha: "blob1" }],
        })
      );
      expect(gitMock.createCommit).toHaveBeenCalledWith(
        expect.objectContaining({ message: "feat: x segredo", parents: ["parent"] })
      );
      expect(gitMock.updateRef).toHaveBeenCalledWith(
        expect.objectContaining({ sha: "commit1", force: false })
      );
      expect(OctokitMock).toHaveBeenLastCalledWith({ auth: "write-token-456" });
    });

    it("non-fast-forward vira CONFLICT", async () => {
      mockHappyPath();
      gitMock.updateRef.mockRejectedValue({ status: 422, message: "token-xyz" });
      const err = await writeGithubFilesAtomic({
        branch: "edi-1",
        files: [{ path: "content/a.md", content: "x" }],
      }).catch((e) => e);
      expect(err).toBeInstanceOf(GithubContentError);
      expect(err.code).toBe("CONFLICT");
    });

    it("erro upstream é sanitizado", async () => {
      gitMock.getRef.mockRejectedValue({ status: 500, message: "Bearer write-token-456" });
      const err = await writeGithubFilesAtomic({
        branch: "edi-1",
        files: [{ path: "content/a.md", content: "x" }],
      }).catch((e) => e);
      expect(err.code).toBe("UPSTREAM");
      expect(err.message).not.toContain("write-token");
    });

    it.each(["../x", "content/../core/a.ts", "core/a.ts", "data/projects/im/schema.json", ".github/w.yml", "content\\a", "content"])(
      "rejeita path %s antes de chamar a API",
      async (path) => {
        const err = await writeGithubFilesAtomic({
          branch: "edi-1",
          files: [{ path: "content/ok.md", content: "x" }, { path, content: "x" }],
        }).catch((e) => e);
        expect(err.code).toBe("PATH_FORBIDDEN");
        expect(gitMock.getRef).not.toHaveBeenCalled();
      }
    );

    it("aceita data/access/permissions.json", async () => {
      mockHappyPath();
      await writeGithubFilesAtomic({
        branch: "portal-state",
        files: [{ path: "data/access/permissions.json", content: "{}" }],
      });
      expect(gitMock.updateRef).toHaveBeenCalled();
    });

    it("aceita data/radar/**", async () => {
      mockHappyPath();
      await writeGithubFilesAtomic({
        branch: "edi-1",
        files: [{ path: "data/radar/a.json", content: "{}" }],
      });
      expect(gitMock.updateRef).toHaveBeenCalled();
    });

    it.each([
      [undefined, "BRANCH_REQUIRED"],
      ["  ", "BRANCH_REQUIRED"],
      ["main", "BRANCH_FORBIDDEN"],
      ["MASTER", "BRANCH_FORBIDDEN"],
      ["refs/heads/main", "BRANCH_FORBIDDEN"],
    ])("branch %s -> %s", async (branch, code) => {
      const err = await writeGithubFilesAtomic({
        branch,
        files: [{ path: "content/a.md", content: "x" }],
      }).catch((e) => e);
      expect(err.code).toBe(code);
      expect(gitMock.getRef).not.toHaveBeenCalled();
    });

    it("sem GITHUB_WRITE_TOKEN -> NOT_CONFIGURED", async () => {
      delete process.env.GITHUB_WRITE_TOKEN;
      const err = await writeGithubFilesAtomic({
        branch: "edi-1",
        files: [{ path: "content/a.md", content: "x" }],
      }).catch((e) => e);
      expect(err.code).toBe("NOT_CONFIGURED");
    });

    it("delete usa sha null na tree; arquivo ausente retorna false", async () => {
      mockHappyPath();
      getContentMock.mockResolvedValueOnce({ data: { type: "file", content: "x" } });
      expect(await deleteGithubFile("content/a.md", { branch: "edi-1" })).toBe(true);
      expect(gitMock.createBlob).not.toHaveBeenCalled();
      expect(gitMock.createTree).toHaveBeenCalledWith(
        expect.objectContaining({
          tree: [{ path: "content/a.md", mode: "100644", type: "blob", sha: null }],
        })
      );

      getContentMock.mockRejectedValueOnce(new Error("404"));
      expect(await deleteGithubFile("content/b.md", { branch: "edi-1" })).toBe(false);
    });
  });});
