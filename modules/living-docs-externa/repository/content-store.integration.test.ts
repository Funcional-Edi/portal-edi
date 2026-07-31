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

vi.mock("@octokit/rest", () => ({
  Octokit: OctokitMock,
}));

import { getContentBackend } from "@/core/db/adapters";
import {
  getProject,
  listProjectSlugs,
} from "@/modules/living-docs-externa/repository/project-repository";
import { listManualSections } from "@/modules/living-docs-externa/repository/section-repository";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";
import { getPublishedManualSections } from "@/modules/living-docs-externa/services/get-published-manual-sections";
import { listPublishedManuals } from "@/modules/living-docs-externa/services/list-published-manuals";

const originalEnv = { ...process.env };

const DEMO_CONFIG = {
  slug: "demo",
  name: "Demo — Inventário (IM)",
  description: "Manual de demonstração.",
  environment: "homolog",
  graphqlUrl: "https://gateway-homologa.fidelize.com.br/graphql",
  gatewaySlug: "gateway-homolog-fidelize",
  published: true,
  audience: "distribuidor",
  createdAt: "2026-07-27T12:00:00.000Z",
  updatedAt: "2026-07-27T12:00:00.000Z",
};

const DEMO_MANUAL = {
  version: 1,
  title: "Integração IM — Inventário (demo)",
  operations: [
    {
      kind: "mutation",
      name: "createToken",
      order: 1,
      title: "1. Obter token",
      description: "Autentique no gateway.",
    },
  ],
};

function toBase64(value: string): string {
  return Buffer.from(value, "utf8").toString("base64");
}

function fileResponse(content: string) {
  return {
    data: {
      type: "file" as const,
      encoding: "base64",
      content: toBase64(content),
    },
  };
}

function setupGithubEnv() {
  process.env.GITHUB_REPO_OWNER = "acme";
  process.env.GITHUB_REPO_NAME = "cms";
  process.env.GITHUB_TOKEN = "token-test";
}

function clearGithubEnv() {
  delete process.env.GITHUB_REPO_OWNER;
  delete process.env.GITHUB_REPO_NAME;
  delete process.env.GITHUB_TOKEN;
}

describe("content store — integração ponta a ponta (local)", () => {
  beforeEach(() => {
    clearGithubEnv();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("usa backend local quando GITHUB_* não está configurado", () => {
    expect(getContentBackend()).toBe("local");
  });

  it("repository → service lista demo publicado", async () => {
    const manuals = await listPublishedManuals();
    expect(manuals.some((m) => m.slug === "demo" && m.published)).toBe(true);
  });

  it("repository → service carrega projeto e seções do seed", async () => {
    const project = await getPublishedManual("demo");
    expect(project?.config.slug).toBe("demo");
    expect(project?.manual.operations.length).toBeGreaterThanOrEqual(2);

    const sections = await getPublishedManualSections("demo");
    expect(sections.map((s) => s.id)).toEqual(
      expect.arrayContaining(["visao-geral", "limites"])
    );
  });

  it("listProjectSlugs encontra demo no filesystem", async () => {
    const slugs = await listProjectSlugs();
    expect(slugs).toContain("demo");
  });
});

describe("content store — integração ponta a ponta (GitHub mockado)", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    setupGithubEnv();
    getContentMock.mockReset();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("usa backend github quando GITHUB_* está completo", () => {
    expect(getContentBackend()).toBe("github");
  });

  it("repository → service lê projeto remoto via facade", async () => {
    getContentMock.mockImplementation(async ({ path }: { path: string }) => {
      if (path === "content/projects") {
        return { data: [{ type: "dir", name: "demo" }] };
      }
      if (path === "content/projects/demo/config.json") {
        return fileResponse(JSON.stringify(DEMO_CONFIG));
      }
      if (path === "content/projects/demo/manual.json") {
        return fileResponse(JSON.stringify(DEMO_MANUAL));
      }
      if (path === "content/projects/demo/sections") {
        return {
          data: [
            { type: "file", name: "visao-geral.md" },
            { type: "file", name: "limites.md" },
          ],
        };
      }
      if (path === "content/projects/demo/sections/visao-geral.md") {
        return fileResponse("# Visão geral\n\nConteúdo remoto createToken.");
      }
      if (path === "content/projects/demo/sections/limites.md") {
        return fileResponse("# Limites\n\nAté 500 produtos.");
      }
      throw new Error(`404: ${path}`);
    });

    const slugs = await listProjectSlugs();
    expect(slugs).toEqual(["demo"]);

    const project = await getProject("demo");
    expect(project?.config.slug).toBe("demo");
    expect(project?.manual.operations).toHaveLength(1);
    expect(project?.manual.operations[0]?.name).toBe("createToken");

    const sections = await listManualSections("demo");
    expect(sections).toHaveLength(2);
    expect(sections[0]?.id).toBe("limites");
    expect(sections[1]?.id).toBe("visao-geral");
    expect(sections[1]?.title).toBe("Visão geral");
    expect(sections[1]?.body).toContain("createToken");

    const published = await getPublishedManualSections("demo");
    expect(published).toHaveLength(2);

    const manuals = await listPublishedManuals();
    expect(manuals).toHaveLength(1);
    expect(manuals[0]?.slug).toBe("demo");
  });

  it("retorna null/vazio para slug inexistente no GitHub", async () => {
    getContentMock.mockRejectedValue(new Error("404"));

    expect(await getProject("inexistente")).toBeNull();
    expect(await listManualSections("inexistente")).toEqual([]);
    expect(await getPublishedManualSections("inexistente")).toEqual([]);
  });
});
