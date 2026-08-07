"use client";

import type { FlowNodeType } from "@/modules/fluxogramas/schema";
import { Handle, Position, type NodeProps } from "@xyflow/react";

interface FlowNodeData {
  label: string;
  operationRef?: { kind: string; name: string };
}

const baseClass =
  "rounded-md border px-3 py-2 text-xs font-medium shadow-sm min-w-[8rem] text-center";

function readNodeData(data: Record<string, unknown>): FlowNodeData {
  return {
    label: String(data.label ?? ""),
    operationRef: data.operationRef as FlowNodeData["operationRef"],
  };
}

function StartNode({ data }: NodeProps) {
  const nodeData = readNodeData(data);
  return (
    <div className={`${baseClass} border-emerald-300 bg-emerald-50 text-emerald-900`}>
      {nodeData.label}
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />
    </div>
  );
}

function EndNode({ data }: NodeProps) {
  const nodeData = readNodeData(data);
  return (
    <div className={`${baseClass} border-rose-300 bg-rose-50 text-rose-900`}>
      <Handle type="target" position={Position.Top} className="!bg-rose-500" />
      {nodeData.label}
    </div>
  );
}

function OperationNode({ data }: NodeProps) {
  const nodeData = readNodeData(data);
  return (
    <div className={`${baseClass} border-brand-300 bg-brand-50 text-brand-900`}>
      <Handle type="target" position={Position.Top} className="!bg-brand-500" />
      <p>{nodeData.label}</p>
      {nodeData.operationRef ? (
        <p className="mt-1 font-mono text-[10px] text-brand-700">
          {nodeData.operationRef.kind}/{nodeData.operationRef.name}
        </p>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="!bg-brand-500" />
    </div>
  );
}

function DecisionNode({ data }: NodeProps) {
  const nodeData = readNodeData(data);
  return (
    <div
      className={`${baseClass} rotate-0 border-amber-300 bg-amber-50 text-amber-900`}
      style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-500" />
      <p className="px-2 py-3">{nodeData.label}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500" />
    </div>
  );
}

export const flowNodeTypes = {
  start: StartNode,
  operation: OperationNode,
  decision: DecisionNode,
  end: EndNode,
};

export const FLOW_NODE_TYPE_LABELS: Record<FlowNodeType, string> = {
  start: "Início",
  operation: "Operação GraphQL",
  decision: "Decisão",
  end: "Fim",
};
