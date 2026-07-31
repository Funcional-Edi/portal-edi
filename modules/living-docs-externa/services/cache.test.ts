import { beforeEach, describe, expect, it, vi } from "vitest";

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
    getContentBackendMock.mockReturnValue("local");
  });

  it("cacheia listPublishedManuals com tag global de projetos", async () => {
    listPublishedProjectSummariesMock.mockResolvedValue([]);

    const { listPublishedManuals } = await import(
      "@/modules/living-docs-externa/services/list-published-manuals"
    );

    await listPublishedManuals();

    expect(unstableCacheMock).toHaveBeenCalledWith(
      expect.any(Function),
      ["list-published-manuals", "local"],
      { tags: ["living-docs:projects"] }
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
      ["get-published-manual", "local", "demo"],
      { tags: ["living-docs:project:demo"] }
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
      ["get-published-manual-sections", "local", "demo"],
      { tags: ["living-docs:project:demo"] }
    );
  });
});
