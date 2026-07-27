import { notFound } from "next/navigation";

import { ManualRoteiro } from "@/modules/living-docs-externa/ui/reader/manual-roteiro";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";

interface ManualPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ManualPage({ params }: ManualPageProps) {
  const { slug } = await params;
  const project = await getPublishedManual(slug);
  if (!project) notFound();

  return <ManualRoteiro project={project} />;
}
