import { notFound } from "next/navigation";

import { auth, isAdminRole } from "@/core/auth";
import { ManualRoteiro } from "@/modules/living-docs-externa/ui/reader/manual-roteiro";
import { ManualShellWithNav } from "@/modules/living-docs-externa/ui/reader/manual-shell-with-nav";
import {
  hasPublishedSchemaSnapshot,
  schemaReferenceHref,
} from "@/modules/living-docs-externa/services/get-published-schema";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";
import { getPublishedManualSections } from "@/modules/living-docs-externa/services/get-published-manual-sections";
import { getIntegrationFlows } from "@/modules/fluxogramas/repository/flow-repository";

interface DocsGuidePageProps {
  params: Promise<{ slug: string }>;
}

export default async function DocsGuidePage({ params }: DocsGuidePageProps) {
  const { slug } = await params;
  const session = await auth();
  const canUsePlayground = Boolean(session?.user?.role && isAdminRole(session.user.role));

  const [project, sections, flows, hasSchema] = await Promise.all([
    getPublishedManual(slug),
    getPublishedManualSections(slug),
    getIntegrationFlows(slug),
    hasPublishedSchemaSnapshot(slug),
  ]);
  if (!project) notFound();

  return (
    <ManualShellWithNav slug={slug} project={project} sections={sections} flowAvailable={hasFlow}>
      <ManualRoteiro
        project={project}
        sections={sections}
        flowLinks={flows.map((flow) => ({
          id: flow.id,
          title: flow.title,
          description: flow.description,
          href: `/fluxogramas/${slug}?fluxo=${encodeURIComponent(flow.id)}`,
        }))}
        schemaReferenceHref={hasSchema ? schemaReferenceHref(slug) : undefined}
        canUsePlayground={canUsePlayground}
      />
    </ManualShellWithNav>
  );
}
