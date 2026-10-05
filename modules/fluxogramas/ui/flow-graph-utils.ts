import { MarkerType, type Edge, type Node } from "@xyflow/react";

import { FLOW_LAYOUT_DEFAULTS } from "@/modules/fluxogramas/config/flow-layout";
import type { IntegrationFlow } from "@/modules/fluxogramas/schema";

export function integrationFlowToGraph(flow: IntegrationFlow): {
  nodes: Node[];
  edges: Edge[];
} {
  const handlesByNode = new Map<string, { source: string[]; target: string[] }>();
  for (const node of flow.nodes) handlesByNode.set(node.id, { source: [], target: [] });
  for (const edge of flow.edges) {
    if (edge.sourceHandle) handlesByNode.get(edge.source)?.source.push(edge.sourceHandle);
    if (edge.targetHandle) handlesByNode.get(edge.target)?.target.push(edge.targetHandle);
  }

  return {
    nodes: flow.nodes.map((node) => {
      const handles = handlesByNode.get(node.id);
      return {
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.label,
          operationRef: node.operationRef,
          sourceHandles: [...new Set(handles?.source)],
          targetHandles: [...new Set(handles?.target)],
        },
      };
    }),
    edges: flow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: FLOW_LAYOUT_DEFAULTS.edgeType,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
      label: edge.label,
      style: {
        stroke: FLOW_LAYOUT_DEFAULTS.edgeColor,
        strokeWidth: FLOW_LAYOUT_DEFAULTS.edgeStrokeWidth,
        strokeLinecap: "butt",
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: FLOW_LAYOUT_DEFAULTS.edgeColor },
      pathOptions: { offset: FLOW_LAYOUT_DEFAULTS.edgeOffset },
      labelStyle: { fill: "#0f172a", fontSize: 11, fontWeight: 600 },
      labelBgStyle: { fill: "#ffffff", fillOpacity: 0.96 },
      labelBgPadding: [6, 3],
      labelBgBorderRadius: 4,
    })),
  };
}

export function graphToIntegrationFlow(
  nodes: Node[],
  edges: Edge[],
  meta: Pick<
    IntegrationFlow,
    "version" | "title" | "description" | "updatedAt" | "lanes" | "annotations"
  >
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
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
      label: edge.label ? String(edge.label) : undefined,
    })),
  };
}

export function createNodeId(type: string): string {
  return `${type}-${crypto.randomUUID().slice(0, 8)}`;
}
