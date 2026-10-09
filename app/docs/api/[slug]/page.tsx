import { notFound } from "next/navigation";

import { getPublishedSchemaReference } from "@/modules/living-docs-externa/services/get-published-schema";
import { docsReturnHref } from "@/modules/living-docs-externa/services/docs-routes";
import { DocsApiShell } from "@/modules/living-docs-externa/ui/reader/docs-api-shell";
import { SchemaReferenceView } from "@/modules/living-docs-externa/ui/reader/schema-reference-view";

interface SchemaReferencePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}

export default async function SchemaReferencePage({ params, searchParams }: SchemaReferencePageProps) {
  const { slug } = await params;
  const { returnTo } = await searchParams;
  const data = await getPublishedSchemaReference(slug);
  if (!data) notFound();

  return (
    <DocsApiShell activeHref={`/docs/api/${slug}`}>
      <SchemaReferenceView data={data} returnHref={docsReturnHref(slug, returnTo)} />
    </DocsApiShell>
  );
}
