import { describe, expect, it } from "vitest";

import {
  createManualOperationInputSchema,
  manualOperationSchema,
} from "@/modules/living-docs-externa/schema/manual";

describe("manualOperationSchema", () => {
  it("aceita operação query/mutation sem method/path", () => {
    const result = manualOperationSchema.safeParse({
      kind: "query",
      name: "listItems",
      order: 1,
    });
    expect(result.success).toBe(true);
  });

  it("aceita operação rest com method e path", () => {
    const result = manualOperationSchema.safeParse({
      kind: "rest",
      name: "autoriza",
      order: 1,
      method: "POST",
      path: "/wsAutorizacao/service.asmx/Autoriza",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita operação rest sem method", () => {
    const result = manualOperationSchema.safeParse({
      kind: "rest",
      name: "autoriza",
      order: 1,
      path: "/wsAutorizacao/service.asmx/Autoriza",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("method"))).toBe(true);
    }
  });

  it("rejeita operação rest sem path", () => {
    const result = manualOperationSchema.safeParse({
      kind: "rest",
      name: "autoriza",
      order: 1,
      method: "POST",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("path"))).toBe(true);
    }
  });
});

describe("createManualOperationInputSchema", () => {
  it("mantém a exigência de method/path para rest na entrada de criação", () => {
    const result = createManualOperationInputSchema.safeParse({
      kind: "rest",
      name: "autoriza",
      method: "POST",
    });
    expect(result.success).toBe(false);
  });

  it("aceita rest com order omitido (auto-atribuído)", () => {
    const result = createManualOperationInputSchema.safeParse({
      kind: "rest",
      name: "autoriza",
      method: "GET",
      path: "/status",
    });
    expect(result.success).toBe(true);
  });
});
