import { describe, expect, it } from "vitest";

import { integrationFlowSchema } from "@/modules/fluxogramas/schema";

describe("integrationFlowSchema", () => {
  it("valida fluxo mínimo", () => {
    const result = integrationFlowSchema.safeParse({
      version: 1,
      title: "Teste",
      nodes: [
        { id: "start", type: "start", label: "Início", position: { x: 0, y: 0 } },
        { id: "end", type: "end", label: "Fim", position: { x: 0, y: 100 } },
      ],
      edges: [{ id: "e1", source: "start", target: "end" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejeita nó sem label", () => {
    const result = integrationFlowSchema.safeParse({
      version: 1,
      title: "Teste",
      nodes: [{ id: "start", type: "start", label: "", position: { x: 0, y: 0 } }],
      edges: [],
    });
    expect(result.success).toBe(false);
  });
});
