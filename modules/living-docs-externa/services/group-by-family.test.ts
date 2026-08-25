import { describe, expect, it } from "vitest";

import { groupByFamily } from "@/modules/living-docs-externa/services/group-by-family";

interface Item {
  slug: string;
  family?: "edi-pharma" | "edi-varejo";
}

describe("groupByFamily", () => {
  it("agrupa itens respeitando a ordem do registry (Pharma antes de Varejo)", () => {
    const items: Item[] = [
      { slug: "edi-canais", family: "edi-varejo" },
      { slug: "im", family: "edi-pharma" },
      { slug: "wholesaler", family: "edi-pharma" },
    ];

    const groups = groupByFamily(items);

    expect(groups.map((g) => g.family)).toEqual(["edi-pharma", "edi-varejo"]);
    expect(groups[0]?.items.map((i) => i.slug)).toEqual(["im", "wholesaler"]);
    expect(groups[1]?.items.map((i) => i.slug)).toEqual(["edi-canais"]);
  });

  it("agrupa itens sem família num bucket 'outros' ao final", () => {
    const items: Item[] = [
      { slug: "legado" },
      { slug: "im", family: "edi-pharma" },
    ];

    const groups = groupByFamily(items);

    expect(groups.map((g) => g.family)).toEqual(["edi-pharma", "outros"]);
    expect(groups.at(-1)?.items.map((i) => i.slug)).toEqual(["legado"]);
  });

  it("não cria seção para família sem itens", () => {
    const items: Item[] = [{ slug: "im", family: "edi-pharma" }];

    const groups = groupByFamily(items);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.family).toBe("edi-pharma");
  });

  it("retorna lista vazia para entrada vazia", () => {
    expect(groupByFamily([])).toEqual([]);
  });

  it("preenche label e description a partir do registry", () => {
    const groups = groupByFamily([{ slug: "im", family: "edi-pharma" }] satisfies Item[]);

    expect(groups[0]?.label).toBe("EDI Pharma");
    expect(groups[0]?.description).toBeTruthy();
  });
});
