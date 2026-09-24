"use client";

import { useMemo } from "react";

import type { IntegrationFlow } from "@/modules/fluxogramas/schema";
import { FlowCanvas } from "@/modules/fluxogramas/ui/flow-canvas";
import { integrationFlowToGraph } from "@/modules/fluxogramas/ui/flow-graph-utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FlowViewerProps {
  flow: IntegrationFlow;
  projectName: string;
  documentationHref: string;
}

export function FlowViewer({ flow, projectName, documentationHref }: FlowViewerProps) {
  const graph = useMemo(() => integrationFlowToGraph(flow), [flow]);

  return (
    <article>
      <header className="mb-6 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-brand-700">Fluxograma de integração</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{flow.title}</h1>
        <p className="mt-1 text-lg text-slate-700">{projectName}</p>
        {flow.description ? (
          <p className="mt-3 text-slate-600">{flow.description}</p>
        ) : null}
        <Link
          href={documentationHref}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar à documentação
        </Link>
      </header>

      <FlowCanvas nodes={graph.nodes} edges={graph.edges} readOnly />
    </article>
  );
}
