"use client";

import { useEffect, useRef, useState } from "react";

import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/diagram-js.css";

import type { IntegrationFlow } from "@/modules/fluxogramas/schema";
import type { ManualRef } from "@/modules/fluxogramas/schema/project-ref";
import {
  bpmnModelerToIntegrationFlow,
  integrationFlowToBpmnXml,
  type BpmnModelerLike,
} from "@/modules/fluxogramas/ui/bpmn-flow-utils";

interface FlowEditorProps {
  slug: string;
  flowId?: string;
  initialFlow: IntegrationFlow;
  manual: ManualRef | null;
}

type BpmnCanvas = { zoom: (value: "fit-viewport") => void };

export function FlowEditor({ slug, flowId, initialFlow }: FlowEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModelerLike | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [title, setTitle] = useState(initialFlow.title);
  const [description, setDescription] = useState(initialFlow.description ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [mermaid, setMermaid] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const flowQuery = flowId ? `?fluxo=${encodeURIComponent(flowId)}` : "";

  useEffect(() => {
    let disposed = false;
    let modeler: BpmnModelerLike | null = null;

    async function mountModeler() {
      if (!canvasRef.current) return;
      try {
        const { default: Modeler } = await import("bpmn-js/lib/Modeler");
        if (disposed || !canvasRef.current) return;
        modeler = new Modeler({
          container: canvasRef.current,
          keyboard: { bindTo: window },
        }) as unknown as BpmnModelerLike;
        modelerRef.current = modeler;
        await modeler.importXML(integrationFlowToBpmnXml(initialFlow));
        if (disposed) return;
        modeler.on("commandStack.changed", () => {
          setDirty(true);
          setStatus(null);
        });
        setEditorError(null);
        setEditorReady(true);
        requestAnimationFrame(() => {
          if (!disposed && modeler) (modeler.get("canvas") as BpmnCanvas).zoom("fit-viewport");
        });
      } catch (error) {
        if (!disposed) setEditorError(error instanceof Error ? error.message : "Não foi possível carregar o editor visual.");
      }
    }

    void mountModeler();
    return () => {
      disposed = true;
      modelerRef.current = null;
      modeler?.destroy();
    };
  }, [initialFlow]);

  useEffect(() => {
    if (!dirty) return;

    function warnAboutUnsavedChanges(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnAboutUnsavedChanges);
    return () => window.removeEventListener("beforeunload", warnAboutUnsavedChanges);
  }, [dirty]);

  function buildPayload(): IntegrationFlow {
    if (!modelerRef.current) throw new Error("O editor visual ainda está carregando.");
    return bpmnModelerToIntegrationFlow(modelerRef.current, {
      version: 1,
      title: title.trim(),
      description: description.trim() || undefined,
    });
  }

  async function saveFlow() {
    const modeler = modelerRef.current;
    if (!modeler) {
      setStatus("Aguarde o carregamento do editor visual.");
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const serialized = await modeler.saveXML({ format: true });
      if (serialized.error) throw serialized.error;
      const response = await fetch(`/api/fluxogramas/${slug}${flowQuery}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setStatus(body.error ?? "Falha ao salvar fluxo.");
        return;
      }
      setDirty(false);
      setStatus("Fluxo salvo com sucesso.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro de rede ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function exportMermaid() {
    setStatus(null);
    try {
      const response = await fetch(`/api/fluxogramas/${slug}/mermaid${flowQuery}`, {
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
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro de rede ao exportar.");
    }
  }

  return (
    <div className="space-y-6" aria-busy={saving || !editorReady}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Título do fluxo</span>
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setDirty(true);
            }}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-slate-700">Descrição</span>
          <textarea
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setDirty(true);
            }}
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">Modelador visual BPMN</p>
          <p className="mt-1 text-sm text-slate-600">
            Use a paleta à esquerda para incluir raias, atividades, decisões, eventos, anotações e setas. Arraste os elementos para organizar o fluxo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void exportMermaid()}
            disabled={!editorReady || saving}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Exportar Mermaid
          </button>
          <button
            type="button"
            onClick={() => void saveFlow()}
            disabled={!editorReady || saving}
            className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={saving ? "Salvando o fluxograma. Aguarde" : "Salvar fluxograma"}
          >
            {saving ? "Salvando… aguarde" : "Salvar fluxograma"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">Como editar:</span> selecione um elemento para mover, redimensionar ou excluir. Para ligar dois elementos, escolha a ferramenta de conexão na paleta e arraste de uma borda até a outra. O rótulo da seta pode ser editado diretamente no diagrama.
      </div>

      <div className="relative h-[min(80vh,58rem)] min-h-[42rem] overflow-hidden rounded-lg border border-slate-200 bg-white" data-testid="bpmn-flow-editor">
        <div ref={canvasRef} className="h-full w-full" />
        {!editorReady && !editorError ? (
          <div className="absolute inset-0 grid place-items-center bg-white/90 text-sm text-slate-600">
            Carregando o modelador visual…
          </div>
        ) : null}
        {editorError ? (
          <div className="absolute inset-0 grid place-items-center bg-white p-6 text-center text-sm text-red-700">
            Não foi possível carregar o modelador visual: {editorError}
          </div>
        ) : null}
      </div>

      {status ? (
        <p className="text-sm text-slate-700" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
      {dirty ? <p className="text-xs font-medium text-amber-700">Há alterações não salvas.</p> : null}

      {mermaid ? (
        <details open className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">Mermaid exportado</summary>
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-slate-700">{mermaid}</pre>
        </details>
      ) : null}
    </div>
  );
}
