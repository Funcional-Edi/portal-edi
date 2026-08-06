import type { Edge, Node } from "@xyflow/react";

import type { IntegrationFlow } from "@/modules/fluxogramas/schema";

export function integrationFlowToGraph(flow: IntegrationFlow): {
  nodes: Node[];
  edges: Edge[];
} {
  return {
    nodes: flow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.label,
        operationRef: node.operationRef,
      },
    })),
    edges: flow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
    })),
  };
}

export function graphToIntegrationFlow(
  nodes: Node[],
  edges: Edge[],
  meta: Pick<IntegrationFlow, "version" | "title" | "description" | "updatedAt">
): IntegrationFlow {
  return {
    ...meta,
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type as IntegrationFlow["nodes"][number]["type"],
      label: String(node.data.label ?? node.id),
      position: node.position,
      operationRef: node.data.operationRef as IntegrationFlow["nodes"][number]["operationRef"],
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label ? String(edge.label) : undefined,
    })),
  };
}

export function createNodeId(type: string): string {
  return `${type}-${crypto.randomUUID().slice(0, 8)}`;
}
