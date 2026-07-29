import { notFound } from "next/navigation";

import { ManualRoteiro } from "@/modules/living-docs-externa/ui/reader/manual-roteiro";
import { ManualShellWithNav } from "@/modules/living-docs-externa/ui/reader/manual-shell-with-nav";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";
import { getPublishedManualSections } from "@/modules/living-docs-externa/services/get-published-manual-sections";

interface ManualPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ManualPage({ params }: ManualPageProps) {
  const { slug } = await params;
  const project = await getPublishedManual(slug);
  if (!project) notFound();

  const sections = await getPublishedManualSections(slug);

  return (
    <ManualShellWithNav slug={slug}>
      <ManualRoteiro project={project} sections={sections} />
    </ManualShellWithNav>
  );
}
