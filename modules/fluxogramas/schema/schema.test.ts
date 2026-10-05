import { describe, expect, it } from "vitest";

import {
  integrationFlowDocumentSchema,
  integrationFlowSchema,
  normalizeIntegrationFlowDocument,
} from "@/modules/fluxogramas/schema";

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

  it("normaliza o formato legado e o documento com múltiplos fluxos", () => {
    const flow = {
      version: 1 as const,
      title: "Teste",
      nodes: [
        { id: "start", type: "start" as const, label: "Início", position: { x: 0, y: 0 } },
      ],
      edges: [],
    };

    expect(normalizeIntegrationFlowDocument(flow)[0].id).toBe("default");

    const document = integrationFlowDocumentSchema.safeParse({
      version: 1,
      flows: [{ id: "fluxo-1", ...flow }],
    });

    expect(document.success).toBe(true);
    if (document.success) {
      expect(normalizeIntegrationFlowDocument(document.data)[0].id).toBe("fluxo-1");
    }
  });
});
