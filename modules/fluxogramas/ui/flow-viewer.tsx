"use client";

import { useEffect, useRef, useState } from "react";

import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/diagram-js.css";

import type { IntegrationFlow } from "@/modules/fluxogramas/schema";
import { integrationFlowToBpmnXml } from "@/modules/fluxogramas/ui/bpmn-flow-utils";
import { ArrowLeft, Maximize2, Move, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";

interface FlowViewerProps {
  flow: IntegrationFlow;
  projectName: string;
  documentationHref: string;
}

type BpmnViewer = {
  importXML(xml: string): Promise<{ warnings: string[] }>;
  get(name: string): unknown;
  destroy(): void;
};

type BpmnCanvas = {
  zoom(): number;
  zoom(value: "fit-viewport" | number): void;
};

export function FlowViewer({ flow, projectName, documentationHref }: FlowViewerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<BpmnViewer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let viewer: BpmnViewer | null = null;

    async function mountViewer() {
      if (!canvasRef.current) return;
      try {
        setViewerReady(false);
        const { default: Viewer } = await import("bpmn-js/lib/Viewer");
        if (disposed || !canvasRef.current) return;
        viewer = new Viewer({ container: canvasRef.current }) as unknown as BpmnViewer;
        viewerRef.current = viewer;
        await viewer.importXML(integrationFlowToBpmnXml(flow));
        if (disposed) return;
        setError(null);
        setViewerReady(true);
        requestAnimationFrame(() => {
          if (!disposed && viewer) (viewer.get("canvas") as BpmnCanvas).zoom("fit-viewport");
        });
      } catch (cause) {
        if (!disposed) setError(cause instanceof Error ? cause.message : "Não foi possível carregar o fluxograma.");
      }
    }

    void mountViewer();
    return () => {
      disposed = true;
      viewer?.destroy();
      if (viewerRef.current === viewer) viewerRef.current = null;
    };
  }, [flow]);

  function zoomBy(delta: number) {
    const canvas = viewerRef.current?.get("canvas") as BpmnCanvas | undefined;
    if (!canvas) return;
    canvas.zoom(Math.min(4, Math.max(0.2, canvas.zoom() + delta)));
  }

  function fitViewport() {
    (viewerRef.current?.get("canvas") as BpmnCanvas | undefined)?.zoom("fit-viewport");
  }

  return (
    <article>
      <header className="mb-6 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-brand-700">Fluxograma de integração</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{flow.title}</h1>
        <p className="mt-1 text-lg text-slate-700">{projectName}</p>
        {flow.description ? (
          <p className="mt-3 whitespace-pre-line text-slate-600">{flow.description}</p>
        ) : null}
        <Link
          href={documentationHref}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar à documentação
        </Link>
      </header>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-3" data-testid="bpmn-flow-navigation">
        <p className="inline-flex items-center gap-1.5 text-sm text-slate-600">
          <Move className="h-4 w-4" aria-hidden="true" />
          Modo de visualização: arraste a área vazia para mover o diagrama.
        </p>
        <div className="flex items-center gap-1" aria-label="Controles de visualização">
          <button
            type="button"
            onClick={() => zoomBy(-0.2)}
            disabled={!viewerReady}
            aria-label="Diminuir zoom"
            className="rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ZoomOut className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(0.2)}
            disabled={!viewerReady}
            aria-label="Aumentar zoom"
            className="rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={fitViewport}
            disabled={!viewerReady}
            aria-label="Ajustar fluxograma à tela"
            className="rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="h-[min(80vh,52rem)] min-h-[38rem] w-full rounded-lg border border-slate-200 bg-white">
        {error ? <p className="p-4 text-sm text-red-700">{error}</p> : null}
        <div ref={canvasRef} data-testid="bpmn-flow-viewer" className="h-full w-full cursor-grab active:cursor-grabbing" />
      </div>
    </article>
  );
}
