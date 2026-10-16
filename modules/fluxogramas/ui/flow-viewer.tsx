"use client";

import { useEffect, useRef, useState } from "react";

import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/diagram-js.css";

import type { IntegrationFlow } from "@/modules/fluxogramas/schema";
import { integrationFlowToBpmnXml } from "@/modules/fluxogramas/ui/bpmn-flow-utils";
import { ArrowLeft } from "lucide-react";
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

type BpmnCanvas = { zoom: (value: "fit-viewport") => void };

export function FlowViewer({ flow, projectName, documentationHref }: FlowViewerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let viewer: BpmnViewer | null = null;

    async function mountViewer() {
      if (!canvasRef.current) return;
      try {
        const { default: Viewer } = await import("bpmn-js/lib/Viewer");
        if (disposed || !canvasRef.current) return;
        viewer = new Viewer({ container: canvasRef.current }) as unknown as BpmnViewer;
        await viewer.importXML(integrationFlowToBpmnXml(flow));
        if (disposed) return;
        setError(null);
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
    };
  }, [flow]);

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

      <div className="h-[min(80vh,52rem)] min-h-[38rem] w-full rounded-lg border border-slate-200 bg-white">
        {error ? <p className="p-4 text-sm text-red-700">{error}</p> : null}
        <div ref={canvasRef} data-testid="bpmn-flow-viewer" className="h-full w-full" />
      </div>
    </article>
  );
}
