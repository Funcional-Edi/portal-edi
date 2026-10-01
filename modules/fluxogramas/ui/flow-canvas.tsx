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
            const lineStartX = annotation.position.x + annotation.width / 2;
            const lineStartY = annotation.position.y + 42;
            const lineEndX = target ? target.position.x + 80 : lineStartX;
            const lineEndY = target ? target.position.y : lineStartY;

            return (
              <div key={annotation.id}>
                {target ? (
                  <svg
                    className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible"
                    width="2400"
                    height="1800"
                    aria-hidden="true"
                  >
                    <line
                      x1={lineStartX}
                      y1={lineStartY}
                      x2={lineEndX}
                      y2={lineEndY}
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
