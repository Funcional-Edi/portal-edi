"use client";

import type { FlowNodeType } from "@/modules/fluxogramas/schema";
import { Handle, Position, type NodeProps } from "@xyflow/react";

interface FlowNodeData {
  label: string;
  operationRef?: { kind: string; name: string };
  sourceHandles?: string[];
  targetHandles?: string[];
}

const baseClass =
  "w-[15rem] min-h-[5rem] rounded-md border px-4 py-3 text-xs font-medium leading-snug shadow-sm text-center break-words";
const terminalClass =
  "w-[10rem] min-h-[4rem] rounded-md border px-3 py-2 text-xs font-medium leading-snug shadow-sm text-center break-words";

function readNodeData(data: Record<string, unknown>): FlowNodeData {
  return {
    label: String(data.label ?? ""),
    operationRef: data.operationRef as FlowNodeData["operationRef"],
    sourceHandles: data.sourceHandles as string[] | undefined,
    targetHandles: data.targetHandles as string[] | undefined,
  };
}

function hasHandle(handles: string[] | undefined, id: string): boolean {
  return handles?.includes(id) ?? false;
}

function TargetHandles({ handles, color }: { handles?: string[]; color: string }) {
  return (
    <>
      {!handles?.length || hasHandle(handles, "in") ? (
        <Handle type="target" id="in" position={Position.Top} className={color} />
      ) : null}
      {hasHandle(handles, "in-left-top") ? (
        <Handle
          type="target"
          id="in-left-top"
          position={Position.Left}
          style={{ top: "28%" }}
          className={color}
        />
      ) : null}
      {hasHandle(handles, "in-left") ? (
        <Handle
          type="target"
          id="in-left"
          position={Position.Left}
          style={{ top: "50%" }}
          className={color}
        />
      ) : null}
      {hasHandle(handles, "in-left-bottom") ? (
        <Handle
          type="target"
          id="in-left-bottom"
          position={Position.Left}
          style={{ top: "72%" }}
          className={color}
        />
      ) : null}
      {hasHandle(handles, "in-right") ? (
        <Handle
          type="target"
          id="in-right"
          position={Position.Right}
          style={{ top: "70%" }}
          className={color}
        />
      ) : null}
      {hasHandle(handles, "in-bottom") ? (
        <Handle
          type="target"
          id="in-bottom"
          position={Position.Bottom}
          style={{ left: "50%" }}
          className={color}
        />
      ) : null}
    </>
  );
}

function SourceHandle({ id, position, style, color }: {
  id: string;
  position: Position;
  style?: React.CSSProperties;
  color: string;
}) {
  return <Handle type="source" id={id} position={position} style={style} className={color} />;
}

function PrimarySourceHandles({ handles, color }: { handles?: string[]; color: string }) {
  return (
    <>
      {!handles?.length || hasHandle(handles, "out") ? (
        <SourceHandle id="out" position={Position.Bottom} color={color} />
      ) : null}
      {hasHandle(handles, "out-right") ? (
        <SourceHandle id="out-right" position={Position.Right} color={color} />
      ) : null}
    </>
  );
}

function StartNode({ data }: NodeProps) {
  const nodeData = readNodeData(data);
  return (
    <div className={`${terminalClass} border-emerald-300 bg-emerald-50 text-emerald-900`}>
      <span className="whitespace-pre-line">{nodeData.label}</span>
      <PrimarySourceHandles handles={nodeData.sourceHandles} color="!bg-emerald-500" />
    </div>
  );
}

function EndNode({ data }: NodeProps) {
  const nodeData = readNodeData(data);
  return (
    <div className={`${terminalClass} border-rose-300 bg-rose-50 text-rose-900`}>
      <TargetHandles handles={nodeData.targetHandles} color="!bg-rose-500" />
      <span className="whitespace-pre-line">{nodeData.label}</span>
    </div>
  );
}

function OperationNode({ data }: NodeProps) {
  const nodeData = readNodeData(data);
  return (
    <div className={`${baseClass} border-brand-300 bg-brand-50 text-brand-900`}>
      <TargetHandles handles={nodeData.targetHandles} color="!bg-brand-500" />
      <p className="whitespace-pre-line">{nodeData.label}</p>
      {nodeData.operationRef ? (
        <p className="mt-1 break-all font-mono text-[10px] leading-snug text-brand-700">
          {nodeData.operationRef.kind}/{nodeData.operationRef.name}
        </p>
      ) : null}
      <PrimarySourceHandles handles={nodeData.sourceHandles} color="!bg-brand-500" />
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
      <TargetHandles handles={nodeData.targetHandles} color="!bg-amber-500" />
      <p className="whitespace-pre-line px-4 py-3">{nodeData.label}</p>
      {(nodeData.sourceHandles?.length ?? 0) === 0 ? (
        <SourceHandle id="out" position={Position.Bottom} color="!bg-amber-500" />
      ) : null}
      {hasHandle(nodeData.sourceHandles, "out-right") ? (
        <SourceHandle
          id="out-right"
          position={Position.Right}
          style={{ top: "50%" }}
          color="!bg-amber-500"
        />
      ) : null}
      {hasHandle(nodeData.sourceHandles, "out-bottom") ? (
        <SourceHandle
          id="out-bottom"
          position={Position.Bottom}
          style={{ left: "50%" }}
          color="!bg-amber-500"
        />
      ) : null}
      {hasHandle(nodeData.sourceHandles, "out-left") ? (
        <SourceHandle
          id="out-left"
          position={Position.Left}
          style={{ top: "50%" }}
          color="!bg-amber-500"
        />
      ) : null}
      {hasHandle(nodeData.sourceHandles, "out-right-top") ? (
        <SourceHandle
          id="out-right-top"
          position={Position.Right}
          style={{ top: "30%" }}
          color="!bg-amber-500"
        />
      ) : null}
      {hasHandle(nodeData.sourceHandles, "out-right-bottom") ? (
        <SourceHandle
          id="out-right-bottom"
          position={Position.Right}
          style={{ top: "70%" }}
          color="!bg-amber-500"
        />
      ) : null}
      {hasHandle(nodeData.sourceHandles, "out-bottom-left") ? (
        <SourceHandle
          id="out-bottom-left"
          position={Position.Bottom}
          style={{ left: "30%" }}
          color="!bg-amber-500"
        />
      ) : null}
      {hasHandle(nodeData.sourceHandles, "out-bottom-right") ? (
        <SourceHandle
          id="out-bottom-right"
          position={Position.Bottom}
          style={{ left: "70%" }}
          color="!bg-amber-500"
        />
      ) : null}
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
