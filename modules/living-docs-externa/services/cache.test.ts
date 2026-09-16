import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  unstableCacheMock,
  getContentBackendMock,
  listPublishedProjectSummariesMock,
  getProjectMock,
  listManualSectionsMock,
} = vi.hoisted(() => ({
  unstableCacheMock: vi.fn((loader: () => Promise<unknown>) => loader),
  getContentBackendMock: vi.fn(() => "local"),
  listPublishedProjectSummariesMock: vi.fn(),
  getProjectMock: vi.fn(),
  listManualSectionsMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: unstableCacheMock,
}));

vi.mock("@/core/db/adapters", () => ({
  getContentBackend: getContentBackendMock,
}));

vi.mock("@/modules/living-docs-externa/repository/project-repository", () => ({
  listPublishedProjectSummaries: listPublishedProjectSummariesMock,
  getProject: getProjectMock,
}));

vi.mock("@/modules/living-docs-externa/repository/section-repository", () => ({
  listManualSections: listManualSectionsMock,
}));

describe("living-docs cache tags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getContentBackendMock.mockReturnValue("github");
    vi.stubEnv("GITHUB_REPO_OWNER", "edi");
    vi.stubEnv("GITHUB_REPO_NAME", "content");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "commit-a");
  });

  afterEach(() => vi.unstubAllEnvs());

  it("cacheia listPublishedManuals com tag global de projetos", async () => {
    listPublishedProjectSummariesMock.mockResolvedValue([]);

    const { listPublishedManuals } = await import(
      "@/modules/living-docs-externa/services/list-published-manuals"
    );

    await listPublishedManuals();

    expect(unstableCacheMock).toHaveBeenCalledWith(
      expect.any(Function),
      ["living-docs:v2", "edi", "content", "commit-a", "list-published-manuals", "github"],
      { tags: ["living-docs:projects"], revalidate: 60 }
    );
  });

  it("cacheia getPublishedManual com tag por slug", async () => {
    getProjectMock.mockResolvedValue({
      config: { slug: "demo", published: true },
      manual: { version: 1, title: "Demo", operations: [] },
    });

    const { getPublishedManual } = await import(
      "@/modules/living-docs-externa/services/get-published-manual"
    );

    await getPublishedManual("demo");

    expect(unstableCacheMock).toHaveBeenCalledWith(
      expect.any(Function),
      ["living-docs:v2", "edi", "content", "commit-a", "get-published-manual", "github", "demo"],
      { tags: ["living-docs:project:demo"], revalidate: 60 }
    );
  });

  it("cacheia getPublishedManualSections com tag por slug", async () => {
    getProjectMock.mockResolvedValue({
      config: { slug: "demo", published: true },
      manual: { version: 1, title: "Demo", operations: [] },
    });
    listManualSectionsMock.mockResolvedValue([]);

    const { getPublishedManualSections } = await import(
      "@/modules/living-docs-externa/services/get-published-manual-sections"
    );

    await getPublishedManualSections("demo");

    expect(unstableCacheMock).toHaveBeenCalledWith(
      expect.any(Function),
      ["living-docs:v2", "edi", "content", "commit-a", "get-published-manual-sections", "github", "demo"],
      { tags: ["living-docs:project:demo"], revalidate: 60 }
    );
  });

  it("relê a família local após uma edição, mesmo em runtime de produção", async () => {
    vi.stubEnv("NODE_ENV", "production");
    getContentBackendMock.mockReturnValue("local");
    const old = { slug: "im", published: true };
    const updated = { ...old, family: "edi-pharma" };
    listPublishedProjectSummariesMock.mockResolvedValueOnce([old]).mockResolvedValueOnce([updated]);
    const { listPublishedManuals } = await import("./list-published-manuals");
    expect(await listPublishedManuals()).toEqual([old]);
    expect(await listPublishedManuals()).toEqual([updated]);
    expect(unstableCacheMock).not.toHaveBeenCalled();
  });

  it("reflete despublicação local no manual e nas seções", async () => {
    getContentBackendMock.mockReturnValue("local");
    const { getPublishedManual } = await import("./get-published-manual");
    const { getPublishedManualSections } = await import("./get-published-manual-sections");
    const project = { config: { slug: "im", published: true }, manual: { title: "IM" } };
    getProjectMock.mockResolvedValue(project);
    listManualSectionsMock.mockResolvedValue([{ id: "intro", body: "Atualizado" }]);
    expect(await getPublishedManual("im")).toEqual(project);
    expect(await getPublishedManualSections("im")).toEqual([{ id: "intro", body: "Atualizado" }]);
    getProjectMock.mockResolvedValue({ ...project, config: { ...project.config, published: false } });
    expect(await getPublishedManual("im")).toBeNull();
    expect(await getPublishedManualSections("im")).toEqual([]);
    expect(unstableCacheMock).not.toHaveBeenCalled();
  });

  it("separa cache remoto quando repositório ou commit mudam", async () => {
    const { listPublishedManuals } = await import("./list-published-manuals");
    listPublishedProjectSummariesMock.mockResolvedValue([]);
    await listPublishedManuals();
    vi.stubEnv("GITHUB_REPO_NAME", "other-content");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "commit-b");
    await listPublishedManuals();
    expect(unstableCacheMock).toHaveBeenLastCalledWith(
      expect.any(Function),
      ["living-docs:v2", "edi", "other-content", "commit-b", "list-published-manuals", "github"],
      { tags: ["living-docs:projects"], revalidate: 60 }
    );
  });
});
