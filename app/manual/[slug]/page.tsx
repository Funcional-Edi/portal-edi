import { notFound } from "next/navigation";

import { ManualRoteiro } from "@/modules/living-docs-externa/ui/reader/manual-roteiro";
import { ManualShellWithNav } from "@/modules/living-docs-externa/ui/reader/manual-shell-with-nav";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";
import { getPublishedManualSections } from "@/modules/living-docs-externa/services/get-published-manual-sections";
import { integrationFlowExists } from "@/modules/fluxogramas/repository/flow-repository";

interface ManualPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ManualPage({ params }: ManualPageProps) {
  const { slug } = await params;
  const [project, sections, hasFlow] = await Promise.all([
    getPublishedManual(slug),
    getPublishedManualSections(slug),
    integrationFlowExists(slug),
  ]);
  if (!project) notFound();

  return (
    <ManualShellWithNav slug={slug} project={project} sections={sections}>
      <ManualRoteiro
        project={project}
        sections={sections}
        flowHref={hasFlow ? `/fluxogramas/${slug}` : undefined}
      />
    </ManualShellWithNav>
  );
}
