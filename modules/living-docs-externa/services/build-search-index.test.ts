import { describe, expect, it } from "vitest";

import { searchIndex } from "@/core/search/fuse-search";
import type { SearchIndexEntry } from "@/core/search/types";

const sampleIndex: SearchIndexEntry[] = [
  {
    type: "manual",
    title: "Integração IM — Inventário",
    href: "/manual/demo",
    snippet: "Manual de demonstração",
    keywords: "demo inventory",
  },
  {
    type: "operation",
    title: "1. Obter token",
    href: "/manual/demo/operations/mutation/createToken",
    snippet: "Autentique no gateway",
    keywords: "mutation createToken demo",
  },
  {
    type: "section",
    title: "Visão geral",
    href: "/manual/demo#section-visao-geral",
    snippet: "Contexto do produto IM",
    keywords: "demo visao-geral",
  },
];

describe("searchIndex", () => {
  it("retorna vazio para query em branco", () => {
    expect(searchIndex(sampleIndex, "")).toEqual([]);
    expect(searchIndex(sampleIndex, "   ")).toEqual([]);
  });

  it("encontra manual e operação por termo parcial", () => {
    const results = searchIndex(sampleIndex, "createToken");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.type === "operation")).toBe(true);
  });

  it("prioriza título de manual para busca por produto", () => {
    const results = searchIndex(sampleIndex, "Inventário");
    expect(results[0]?.type).toBe("manual");
    expect(results[0]?.href).toBe("/manual/demo");
  });
});

describe("buildLivingDocsSearchIndex", () => {
  it("indexa manual demo publicado com operações e seções", async () => {
    const { buildLivingDocsSearchIndex } = await import(
      "@/modules/living-docs-externa/services/build-search-index"
    );

    const entries = await buildLivingDocsSearchIndex(false);
    expect(entries.some((e) => e.type === "manual" && e.href === "/manual/demo")).toBe(
      true
    );
    expect(
      entries.some(
        (e) =>
          e.type === "operation" &&
          e.href.includes("/operations/mutation/createToken")
      )
    ).toBe(true);
  });
});
