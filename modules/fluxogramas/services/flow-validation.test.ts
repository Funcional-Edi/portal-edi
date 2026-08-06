import { describe, expect, it } from "vitest";

import {
  exportFlowToMermaid,
  mermaidEscapeLabel,
  validateIntegrationFlow,
} from "@/modules/fluxogramas/services/flow-validation";
import type { IntegrationFlow } from "@/modules/fluxogramas/schema";

const sampleFlow: IntegrationFlow = {
  version: 1,
  title: "Fluxo demo",
  nodes: [
    { id: "start", type: "start", label: "Início", position: { x: 0, y: 0 } },
    {
      id: "op1",
      type: "operation",
      label: "createToken",
      position: { x: 0, y: 80 },
      operationRef: { kind: "mutation", name: "createToken" },
    },
    {
      id: "decision",
      type: "decision",
      label: "Token OK?",
      position: { x: 0, y: 160 },
    },
    { id: "end", type: "end", label: "Fim", position: { x: 0, y: 240 } },
  ],
  edges: [
    { id: "e1", source: "start", target: "op1" },
    { id: "e2", source: "op1", target: "decision" },
    { id: "e3", source: "decision", target: "end", label: "Sim" },
  ],
};

describe("validateIntegrationFlow", () => {
  it("aceita fluxo mínimo válido", () => {
    const issues = validateIntegrationFlow(sampleFlow, {
      operations: [{ kind: "mutation", name: "createToken" }],
    });
    expect(issues).toHaveLength(0);
  });

  it("rejeita operação ausente no manual", () => {
    const issues = validateIntegrationFlow(sampleFlow, { operations: [] });
    expect(issues.some((issue) => issue.code === "UNKNOWN_OPERATION")).toBe(true);
  });

  it("rejeita fluxo sem nó de início", () => {
    const flow: IntegrationFlow = {
      ...sampleFlow,
      nodes: sampleFlow.nodes.filter((node) => node.type !== "start"),
    };
    const issues = validateIntegrationFlow(flow);
    expect(issues.some((issue) => issue.code === "MISSING_START")).toBe(true);
  });
});

describe("exportFlowToMermaid", () => {
  it("gera flowchart TD com nós e arestas", () => {
    const mermaid = exportFlowToMermaid(sampleFlow);
    expect(mermaid).toContain("flowchart TD");
    expect(mermaid).toContain('start(("Início"))');
    expect(mermaid).toContain('op1["createToken"]');
    expect(mermaid).toContain('decision{"Token OK?"}');
    expect(mermaid).toContain("decision -->|Sim| end");
  });

  it("escapa caracteres problemáticos nos rótulos", () => {
    expect(mermaidEscapeLabel('A "B" [C]')).toBe("A 'B'  C ");
  });
});
