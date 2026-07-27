import { describe, expect, it } from "vitest";

import { listPublishedManuals } from "@/modules/living-docs-externa/services/list-published-manuals";

describe("listPublishedManuals", () => {
  it("inclui o projeto demo publicado", async () => {
    const manuals = await listPublishedManuals();
    const demo = manuals.find((m) => m.slug === "demo");
    expect(demo).toBeDefined();
    expect(demo?.published).toBe(true);
    expect(demo?.name).toContain("Demo");
  });
});
