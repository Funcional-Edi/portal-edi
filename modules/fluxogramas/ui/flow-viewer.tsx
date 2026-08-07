"use client";

import { useMemo } from "react";

import type { IntegrationFlow } from "@/modules/fluxogramas/schema";
import { FlowCanvas } from "@/modules/fluxogramas/ui/flow-canvas";
import { integrationFlowToGraph } from "@/modules/fluxogramas/ui/flow-graph-utils";

interface FlowViewerProps {
  flow: IntegrationFlow;
  projectName: string;
}

export function FlowViewer({ flow, projectName }: FlowViewerProps) {
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
      </header>

      <FlowCanvas nodes={graph.nodes} edges={graph.edges} readOnly />
    </article>
  );
}
