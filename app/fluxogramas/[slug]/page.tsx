import { notFound } from "next/navigation";

import { GetFlowError, getProjectFlow } from "@/modules/fluxogramas/services/get-flow";
import { getProjectConfigRef } from "@/modules/fluxogramas/repository/flow-repository";
import { FlowShell } from "@/modules/fluxogramas/ui/flow-shell";
import { FlowViewer } from "@/modules/fluxogramas/ui/flow-viewer";

interface FlowDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fluxo?: string }>;
}

export default async function FlowDetailPage({ params, searchParams }: FlowDetailPageProps) {
  const { slug } = await params;
  const { fluxo: flowId } = await searchParams;

  try {
    const [flow, config] = await Promise.all([
      getProjectFlow(slug, { requirePublished: true, flowId }),
      getProjectConfigRef(slug),
    ]);

    if (!config) notFound();

    return (
      <FlowShell subtitle={`Fluxograma — ${config.name}`} documentationHref={`/docs/${slug}#fluxogramas`}>
        <FlowViewer flow={flow} projectName={config.name} documentationHref={`/docs/${slug}#fluxogramas`} />
      </FlowShell>
    );
  } catch (error) {
    if (error instanceof GetFlowError) {
      notFound();
    }
    throw error;
  }
}
