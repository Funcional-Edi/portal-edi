"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { flowNodeTypes } from "@/modules/fluxogramas/ui/flow-node-types";

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  readOnly?: boolean;
  onNodesChange?: Parameters<typeof ReactFlow>[0]["onNodesChange"];
  onEdgesChange?: Parameters<typeof ReactFlow>[0]["onEdgesChange"];
  onConnect?: Parameters<typeof ReactFlow>[0]["onConnect"];
}

export function FlowCanvas({
  nodes,
  edges,
  readOnly = false,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: FlowCanvasProps) {
  return (
    <div className="h-[32rem] w-full rounded-lg border border-slate-200 bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={flowNodeTypes}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} color="#e2e8f0" />
        <Controls showInteractive={!readOnly} />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}
