import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  readLocalJsonMock,
  readLocalTextMock,
  listLocalSubdirsMock,
  listLocalFilesMock,
  readGithubJsonMock,
  readGithubTextMock,
  listGithubSubdirsMock,
  listGithubFilesMock,
} = vi.hoisted(() => ({
  readLocalJsonMock: vi.fn(),
  readLocalTextMock: vi.fn(),
  listLocalSubdirsMock: vi.fn(),
  listLocalFilesMock: vi.fn(),
  readGithubJsonMock: vi.fn(),
  readGithubTextMock: vi.fn(),
  listGithubSubdirsMock: vi.fn(),
  listGithubFilesMock: vi.fn(),
}));

vi.mock("@/core/db/adapters/local-content-store", () => ({
  readLocalJson: readLocalJsonMock,
  readLocalText: readLocalTextMock,
  listLocalSubdirs: listLocalSubdirsMock,
  listLocalFiles: listLocalFilesMock,
  localContentStore: {
    kind: "local-filesystem",
    capabilities: new Set(["content"]),
  },
}));

vi.mock("@/core/db/adapters/github-content-store", () => ({
  readGithubJson: readGithubJsonMock,
  readGithubText: readGithubTextMock,
  listGithubSubdirs: listGithubSubdirsMock,
  listGithubFiles: listGithubFilesMock,
  githubContentStore: {
    kind: "github-content",
    capabilities: new Set(["content"]),
  },
}));

import {
  getContentBackend,
  getContentStore,
  listContentFiles,
  listContentSubdirs,
  readContentJson,
  readContentText,
} from "@/core/db/adapters";

const originalEnv = { ...process.env };

describe("content adapters facade", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GITHUB_REPO_OWNER;
    delete process.env.GITHUB_REPO_NAME;
    delete process.env.GITHUB_TOKEN;

    readLocalJsonMock.mockReset();
    readLocalTextMock.mockReset();
    listLocalSubdirsMock.mockReset();
    listLocalFilesMock.mockReset();
    readGithubJsonMock.mockReset();
    readGithubTextMock.mockReset();
    listGithubSubdirsMock.mockReset();
    listGithubFilesMock.mockReset();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("mantém backend local quando GITHUB_* não está configurado", async () => {
    readLocalJsonMock.mockResolvedValueOnce({ ok: true });
    readLocalTextMock.mockResolvedValueOnce("texto local");
    listLocalSubdirsMock.mockResolvedValueOnce(["demo"]);
    listLocalFilesMock.mockResolvedValueOnce(["a.md"]);

    expect(getContentBackend()).toBe("local");
    expect(getContentStore().kind).toBe("local-filesystem");
    expect(await readContentJson("content/projects/demo/config.json")).toEqual({ ok: true });
    expect(await readContentText("content/projects/demo/sections/a.md")).toBe("texto local");
    expect(await listContentSubdirs("content/projects")).toEqual(["demo"]);
    expect(await listContentFiles("content/projects/demo/sections")).toEqual(["a.md"]);
  });

  it("usa backend github quando GITHUB_* está completo", async () => {
    process.env.GITHUB_REPO_OWNER = "acme";
    process.env.GITHUB_REPO_NAME = "cms";
    process.env.GITHUB_TOKEN = "token";

    readGithubJsonMock.mockResolvedValueOnce({ ok: "github" });
    readGithubTextMock.mockResolvedValueOnce("texto remoto");
    listGithubSubdirsMock.mockResolvedValueOnce(["demo", "im"]);
    listGithubFilesMock.mockResolvedValueOnce(["intro.md"]);

    expect(getContentBackend()).toBe("github");
    expect(getContentStore().kind).toBe("github-content");
    expect(await readContentJson("content/projects/demo/config.json")).toEqual({
      ok: "github",
    });
    expect(await readContentText("content/projects/demo/sections/intro.md")).toBe(
      "texto remoto"
    );
    expect(await listContentSubdirs("content/projects")).toEqual(["demo", "im"]);
    expect(await listContentFiles("content/projects/demo/sections")).toEqual([
      "intro.md",
    ]);
  });
});
