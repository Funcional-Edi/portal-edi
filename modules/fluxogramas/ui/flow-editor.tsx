"use client";

import {
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Node,
} from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";

import type { IntegrationFlow } from "@/modules/fluxogramas/schema";
import type { ManualRef } from "@/modules/fluxogramas/schema/project-ref";
import {
  FLOW_NODE_TYPE_LABELS,
} from "@/modules/fluxogramas/ui/flow-node-types";
import { FlowCanvas } from "@/modules/fluxogramas/ui/flow-canvas";
import {
  createNodeId,
  graphToIntegrationFlow,
  integrationFlowToGraph,
} from "@/modules/fluxogramas/ui/flow-graph-utils";
import type { FlowNodeType } from "@/modules/fluxogramas/schema";

interface FlowEditorProps {
  slug: string;
  initialFlow: IntegrationFlow;
  manual: ManualRef | null;
}

export function FlowEditor({ slug, initialFlow, manual }: FlowEditorProps) {
  const initialGraph = useMemo(() => integrationFlowToGraph(initialFlow), [initialFlow]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);
  const [title, setTitle] = useState(initialFlow.title);
  const [description, setDescription] = useState(initialFlow.description ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [mermaid, setMermaid] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            id: createNodeId("edge"),
          },
          current
        )
      );
    },
    [setEdges]
  );

  const addNode = (type: FlowNodeType) => {
    const id = createNodeId(type);
    const y = 80 + nodes.length * 72;
    const newNode: Node = {
      id,
      type,
      position: { x: 180, y },
      data: {
        label: FLOW_NODE_TYPE_LABELS[type],
        operationRef:
          type === "operation" && manual?.operations[0]
            ? { kind: manual.operations[0].kind, name: manual.operations[0].name }
            : undefined,
      },
    };
    setNodes((current) => [...current, newNode]);
  };

  const buildPayload = (): IntegrationFlow =>
    graphToIntegrationFlow(nodes, edges, {
      version: 1,
      title,
      description: description.trim() || undefined,
      updatedAt: initialFlow.updatedAt,
    });

  const saveFlow = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch(`/api/fluxogramas/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const body = (await response.json()) as { error?: string; details?: unknown };
      if (!response.ok) {
        setStatus(body.error ?? "Falha ao salvar fluxo.");
        return;
      }
      setStatus("Fluxo salvo com sucesso.");
    } catch {
      setStatus("Erro de rede ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const exportMermaid = async () => {
    setStatus(null);
    try {
      const response = await fetch(`/api/fluxogramas/${slug}/mermaid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const body = (await response.json()) as { mermaid?: string; error?: string };
      if (!response.ok) {
        setStatus(body.error ?? "Falha ao exportar Mermaid.");
        return;
      }
      setMermaid(body.mermaid ?? null);
    } catch {
      setStatus("Erro de rede ao exportar.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Título do fluxo</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-slate-700">Descrição</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(FLOW_NODE_TYPE_LABELS) as FlowNodeType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addNode(type)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            + {FLOW_NODE_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <FlowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={saveFlow}
          disabled={saving}
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar fluxo"}
        </button>
        <button
          type="button"
          onClick={exportMermaid}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Exportar Mermaid
        </button>
      </div>

      {status ? <p className="text-sm text-slate-600">{status}</p> : null}

      {mermaid ? (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Mermaid</p>
          <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4 text-xs text-slate-100">
            {mermaid}
          </pre>
        </div>
      ) : null}

      {manual && manual.operations.length > 0 ? (
        <p className="text-xs text-slate-500">
          Operações disponíveis no manual:{" "}
          {manual.operations.map((op) => `${op.kind}/${op.name}`).join(", ")}
        </p>
      ) : null}
    </div>
  );
}
