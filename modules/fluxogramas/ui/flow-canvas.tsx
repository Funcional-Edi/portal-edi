"use client";

import {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  MarkerType,
  ReactFlow,
  ViewportPortal,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { FLOW_LAYOUT_DEFAULTS } from "@/modules/fluxogramas/config/flow-layout";
import type { FlowAnnotation, FlowLane } from "@/modules/fluxogramas/schema";
import { flowNodeTypes } from "@/modules/fluxogramas/ui/flow-node-types";

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  lanes?: FlowLane[];
  annotations?: FlowAnnotation[];
  readOnly?: boolean;
  onNodesChange?: Parameters<typeof ReactFlow>[0]["onNodesChange"];
  onEdgesChange?: Parameters<typeof ReactFlow>[0]["onEdgesChange"];
  onConnect?: Parameters<typeof ReactFlow>[0]["onConnect"];
}

const ANNOTATION_HEIGHT = 42;

function nodeSize(node: Node): { width: number; height: number } {
  return node.type === "start" || node.type === "end"
    ? { width: 160, height: 64 }
    : { width: 240, height: 80 };
}

function annotationConnector(annotation: FlowAnnotation, target: Node) {
  const targetSize = nodeSize(target);
  const annotationCenter = {
    x: annotation.position.x + annotation.width / 2,
    y: annotation.position.y + ANNOTATION_HEIGHT / 2,
  };
  const targetCenter = {
    x: target.position.x + targetSize.width / 2,
    y: target.position.y + targetSize.height / 2,
  };

  const overlapsHorizontally =
    annotation.position.x < target.position.x + targetSize.width
    && annotation.position.x + annotation.width > target.position.x;

  if (!overlapsHorizontally && Math.abs(annotationCenter.x - targetCenter.x) > Math.abs(annotationCenter.y - targetCenter.y)) {
    const annotationIsRight = annotationCenter.x > targetCenter.x;
    return {
      start: {
        x: annotationIsRight ? annotation.position.x : annotation.position.x + annotation.width,
        y: annotationCenter.y,
      },
      end: {
        x: annotationIsRight ? target.position.x + targetSize.width : target.position.x,
        y: targetCenter.y,
      },
    };
  }

  const annotationIsBelow = annotationCenter.y > targetCenter.y;
  return {
    start: {
      x: annotationCenter.x,
      y: annotationIsBelow ? annotation.position.y : annotation.position.y + ANNOTATION_HEIGHT,
    },
    end: {
      x: targetCenter.x,
      y: annotationIsBelow ? target.position.y + targetSize.height : target.position.y,
    },
  };
}

export function FlowCanvas({
  nodes,
  edges,
  lanes,
  annotations,
  readOnly = false,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: FlowCanvasProps) {
  const annotationCanvas = {
    width: Math.max(
      1,
      ...nodes.map((node) => node.position.x + nodeSize(node).width),
      ...(lanes ?? []).map((lane) => lane.position.x + lane.width),
      ...(annotations ?? []).map((annotation) => annotation.position.x + annotation.width),
    ) + 32,
    height: Math.max(
      1,
      ...nodes.map((node) => node.position.y + nodeSize(node).height),
      ...(lanes ?? []).map((lane) => lane.position.y + lane.height),
      ...(annotations ?? []).map((annotation) => annotation.position.y + ANNOTATION_HEIGHT),
    ) + 32,
  };

  return (
    <div className="h-[min(80vh,52rem)] min-h-[38rem] w-full rounded-lg border border-slate-200 bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={flowNodeTypes}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        connectionLineType={ConnectionLineType.Step}
        defaultEdgeOptions={{
          type: FLOW_LAYOUT_DEFAULTS.edgeType,
          style: {
            stroke: FLOW_LAYOUT_DEFAULTS.edgeColor,
            strokeWidth: FLOW_LAYOUT_DEFAULTS.edgeStrokeWidth,
            strokeLinecap: "butt",
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: FLOW_LAYOUT_DEFAULTS.edgeColor },
          labelStyle: { fill: "#0f172a", fontSize: 11, fontWeight: 600 },
          labelBgStyle: { fill: "#ffffff", fillOpacity: 0.96 },
          labelBgPadding: [6, 3],
          labelBgBorderRadius: 4,
        }}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        snapToGrid
        snapGrid={FLOW_LAYOUT_DEFAULTS.snapGrid}
        fitView
        fitViewOptions={{ padding: 0.06 }}
        proOptions={{ hideAttribution: true }}
      >
        <ViewportPortal>
          {lanes?.map((lane) => (
            <div
              key={lane.id}
              className="pointer-events-none absolute z-[-1] border border-slate-400 bg-slate-50/50"
              style={{
                left: lane.position.x,
                top: lane.position.y,
                width: lane.width,
                height: lane.height,
              }}
              aria-hidden="true"
            >
              <span
                className="absolute left-1 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {lane.label}
              </span>
            </div>
          ))}
          {annotations?.map((annotation) => {
            const target = annotation.targetNodeId
              ? nodes.find((node) => node.id === annotation.targetNodeId)
              : undefined;
            const connector = target ? annotationConnector(annotation, target) : null;

            return (
              <div key={annotation.id}>
                {connector ? (
                  <svg
                    className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible"
                    width={annotationCanvas.width}
                    height={annotationCanvas.height}
                    aria-hidden="true"
                  >
                    <line
                      x1={connector.start.x}
                      y1={connector.start.y}
                      x2={connector.end.x}
                      y2={connector.end.y}
                      stroke="#64748b"
                      strokeDasharray="5 5"
                    />
                  </svg>
                ) : null}
                <div
                  className="pointer-events-none absolute z-10 border border-slate-400 bg-slate-200 px-2 py-1 text-[10px] leading-tight text-slate-700 shadow-sm"
                  style={{
                    left: annotation.position.x,
                    top: annotation.position.y,
                    width: annotation.width,
                  }}
                >
                  {annotation.text}
                </div>
              </div>
            );
          })}
        </ViewportPortal>
        <Background gap={16} size={1} color="#e2e8f0" />
        <Controls showInteractive={!readOnly} />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}
