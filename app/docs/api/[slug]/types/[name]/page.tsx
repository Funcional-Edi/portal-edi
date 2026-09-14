import { notFound } from "next/navigation";

import { getPublishedSchemaTypeDetail } from "@/modules/living-docs-externa/services/get-published-schema";
import { DocsApiShell } from "@/modules/living-docs-externa/ui/reader/docs-api-shell";
import { SchemaTypeDetailView } from "@/modules/living-docs-externa/ui/reader/schema-type-detail-view";

interface SchemaTypeDetailPageProps {
  params: Promise<{ slug: string; name: string }>;
}

export default async function SchemaTypeDetailPage({ params }: SchemaTypeDetailPageProps) {
  const { slug, name } = await params;
  const data = await getPublishedSchemaTypeDetail(slug, decodeURIComponent(name));
  if (!data) notFound();

  return (
    <DocsApiShell activeHref={`/docs/api/${slug}`}>
      <SchemaTypeDetailView data={data} />
    </DocsApiShell>
  );
}
