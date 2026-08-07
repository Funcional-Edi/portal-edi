import { notFound } from "next/navigation";

import { GetFlowError, getProjectFlow } from "@/modules/fluxogramas/services/get-flow";
import { getProjectConfigRef } from "@/modules/fluxogramas/repository/flow-repository";
import { FlowShell } from "@/modules/fluxogramas/ui/flow-shell";
import { FlowViewer } from "@/modules/fluxogramas/ui/flow-viewer";

interface FlowDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function FlowDetailPage({ params }: FlowDetailPageProps) {
  const { slug } = await params;

  try {
    const [flow, config] = await Promise.all([
      getProjectFlow(slug, { requirePublished: true }),
      getProjectConfigRef(slug),
    ]);

    if (!config) notFound();

    return (
      <FlowShell subtitle={`Fluxograma — ${config.name}`}>
        <FlowViewer flow={flow} projectName={config.name} />
      </FlowShell>
    );
  } catch (error) {
    if (error instanceof GetFlowError) {
      notFound();
    }
    throw error;
  }
}
