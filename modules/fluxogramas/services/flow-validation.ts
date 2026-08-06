import type { FlowNode, IntegrationFlow } from "@/modules/fluxogramas/schema";
import type { ManualRef } from "@/modules/fluxogramas/schema/project-ref";

export interface FlowValidationIssue {
  code: "MISSING_START" | "MISSING_END" | "DUPLICATE_NODE" | "INVALID_EDGE" | "UNKNOWN_OPERATION";
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export function validateIntegrationFlow(
  flow: IntegrationFlow,
  manual?: ManualRef | null
): FlowValidationIssue[] {
  const issues: FlowValidationIssue[] = [];
  const nodeIds = new Set<string>();

  for (const node of flow.nodes) {
    if (nodeIds.has(node.id)) {
      issues.push({
        code: "DUPLICATE_NODE",
        message: `Nó duplicado: ${node.id}`,
        nodeId: node.id,
      });
    }
    nodeIds.add(node.id);
  }

  const starts = flow.nodes.filter((node) => node.type === "start");
  const ends = flow.nodes.filter((node) => node.type === "end");

  if (starts.length === 0) {
    issues.push({ code: "MISSING_START", message: "O fluxo precisa de ao menos um nó de início." });
  }

  if (ends.length === 0) {
    issues.push({ code: "MISSING_END", message: "O fluxo precisa de ao menos um nó de fim." });
  }

  for (const edge of flow.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      issues.push({
        code: "INVALID_EDGE",
        message: `Aresta ${edge.id} referencia nós inexistentes.`,
        edgeId: edge.id,
      });
    }
  }

  if (manual) {
    for (const node of flow.nodes) {
      if (node.type !== "operation" || !node.operationRef) continue;
      const exists = manual.operations.some(
        (op) =>
          op.kind === node.operationRef!.kind && op.name === node.operationRef!.name
      );
      if (!exists) {
        issues.push({
          code: "UNKNOWN_OPERATION",
          message: `Operação ${node.operationRef.kind}/${node.operationRef.name} não existe no manual.`,
          nodeId: node.id,
        });
      }
    }
  }

  return issues;
}

/** Escapa rótulos para sintaxe Mermaid segura. */
export function mermaidEscapeLabel(label: string): string {
  return label.replace(/"/g, "'").replace(/[\[\]{}()<>|]/g, " ");
}

function mermaidNodeShape(node: FlowNode): string {
  const label = mermaidEscapeLabel(node.label);
  switch (node.type) {
    case "start":
      return `${node.id}(("${label}"))`;
    case "end":
      return `${node.id}(("${label}"))`;
    case "decision":
      return `${node.id}{"${label}"}`;
    default:
      return `${node.id}["${label}"]`;
  }
}

/** Converte `IntegrationFlow` em diagrama Mermaid `flowchart TD`. */
export function exportFlowToMermaid(flow: IntegrationFlow): string {
  const lines: string[] = [`flowchart TD`, `  %% ${mermaidEscapeLabel(flow.title)}`];

  for (const node of flow.nodes) {
    lines.push(`  ${mermaidNodeShape(node)}`);
  }

  for (const edge of flow.edges) {
    const edgeLabel = edge.label ? `|${mermaidEscapeLabel(edge.label)}|` : "";
    lines.push(`  ${edge.source} -->${edgeLabel} ${edge.target}`);
  }

  return lines.join("\n");
}
