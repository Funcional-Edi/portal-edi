import { describe, expect, it } from "vitest";

import { titleFromMarkdown } from "@/modules/living-docs-externa/schema/section";
import { getPublishedManualSections } from "@/modules/living-docs-externa/services/get-published-manual-sections";

describe("titleFromMarkdown", () => {
  it("usa o primeiro heading H1", () => {
    expect(titleFromMarkdown("# Olá mundo\n\ntexto", "fallback")).toBe("Olá mundo");
  });

  it("cai no id quando não há H1", () => {
    expect(titleFromMarkdown("só texto", "visao-geral")).toBe("visao-geral");
  });
});

describe("getPublishedManualSections", () => {
  it("lê as seções Markdown do seed demo", async () => {
    const sections = await getPublishedManualSections("demo");
    expect(sections.length).toBeGreaterThanOrEqual(2);

    const ids = sections.map((s) => s.id);
    expect(ids).toContain("visao-geral");
    expect(ids).toContain("limites");

    const visao = sections.find((s) => s.id === "visao-geral");
    expect(visao?.title).toBe("Visão geral");
    expect(visao?.body).toContain("createToken");
  });

  it("retorna vazio para slug inexistente", async () => {
    const sections = await getPublishedManualSections("nao-existe");
    expect(sections).toEqual([]);
  });
});
