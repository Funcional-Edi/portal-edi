import { notFound } from "next/navigation";

import {
  findOperation,
  manualOperationKindSchema,
} from "@/modules/living-docs-externa/schema";
import { OperationDetail } from "@/modules/living-docs-externa/ui/reader/operation-detail";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";

interface OperationPageProps {
  params: Promise<{ slug: string; kind: string; name: string }>;
}

export default async function OperationPage({ params }: OperationPageProps) {
  const { slug, kind, name } = await params;
  const kindResult = manualOperationKindSchema.safeParse(kind);
  if (!kindResult.success) notFound();

  const project = await getPublishedManual(slug);
  if (!project) notFound();

  const operation = findOperation(project.manual, kindResult.data, name);
  if (!operation) notFound();

  return (
    <OperationDetail
      slug={slug}
      manualTitle={project.manual.title}
      operation={operation}
    />
  );
}
