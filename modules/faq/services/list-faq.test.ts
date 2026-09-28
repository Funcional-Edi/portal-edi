import { describe, expect, it } from "vitest";

import { listPublishedFaq } from "@/modules/faq/services/list-faq";

describe("listPublishedFaq", () => {
  it("carrega as respostas publicadas do índice versionado", async () => {
    const entries = await listPublishedFaq();

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.status === "published")).toBe(true);
    expect(entries.map((entry) => entry.slug)).toContain("canal-autorizador");
    expect(entries.find((entry) => entry.slug === "por-onde-comecar")?.body).toContain(
      "documentação do produto",
    );
  });
});
