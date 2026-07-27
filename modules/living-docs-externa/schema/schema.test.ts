import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  integrationManualSchema,
  projectConfigSchema,
} from "@/modules/living-docs-externa/schema";

const demoDir = path.join(process.cwd(), "content/projects/demo");

describe("living-docs-externa schema — seed demo", () => {
  it("valida config.json do projeto demo", () => {
    const raw = readFileSync(path.join(demoDir, "config.json"), "utf8");
    const result = projectConfigSchema.safeParse(JSON.parse(raw));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.published).toBe(true);
      expect(result.data.slug).toBe("demo");
    }
  });

  it("valida manual.json do projeto demo", () => {
    const raw = readFileSync(path.join(demoDir, "manual.json"), "utf8");
    const result = integrationManualSchema.safeParse(JSON.parse(raw));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.operations).toHaveLength(2);
    }
  });
});
