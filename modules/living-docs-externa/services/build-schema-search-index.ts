import type { SearchIndexEntry } from "@/core/search/types";
import {
  getPublishedSchemaReference,
  listPublishedSchemaCatalog,
  schemaFieldHref,
  schemaTypeHref,
} from "@/modules/living-docs-externa/services/get-published-schema";

/** Indexa campos raiz (queries/mutations) e tipos dos snapshots publicados. */
export async function buildSchemaSearchIndex(): Promise<SearchIndexEntry[]> {
  const catalog = await listPublishedSchemaCatalog();
  const entries: SearchIndexEntry[] = [];

  for (const entry of catalog) {
    if (!entry.hasSchema) continue;

    const data = await getPublishedSchemaReference(entry.slug);
    if (!data) continue;

    const productLabel = data.project.config.name;

    for (const field of data.reference.queries) {
      entries.push({
        type: "schema-field",
        title: field.name,
        href: schemaFieldHref(entry.slug, "query", field.name),
        snippet: formatSchemaFieldSnippet("Query", productLabel, field.description),
        keywords: `${entry.slug} query ${field.name} graphql schema referencia ${productLabel}`,
      });
    }

    for (const field of data.reference.mutations) {
      entries.push({
        type: "schema-field",
        title: field.name,
        href: schemaFieldHref(entry.slug, "mutation", field.name),
        snippet: formatSchemaFieldSnippet("Mutation", productLabel, field.description),
        keywords: `${entry.slug} mutation ${field.name} graphql schema referencia ${productLabel}`,
      });
    }

    for (const type of data.reference.types) {
      entries.push({
        type: "schema-type",
        title: type.name,
        href: schemaTypeHref(entry.slug, type.name),
        snippet: formatSchemaTypeSnippet(type.kind, productLabel, type.description, type.fieldCount),
        keywords: `${entry.slug} ${type.kind} ${type.name} graphql schema tipo referencia ${productLabel}`,
      });
    }
  }

  return entries;
}

function formatSchemaFieldSnippet(
  kind: "Query" | "Mutation",
  productLabel: string,
  description?: string
): string {
  const parts = [`${kind} · ${productLabel}`];
  if (description) parts.push(description);
  return parts.join(" · ");
}

function formatSchemaTypeSnippet(
  kind: string,
  productLabel: string,
  description?: string,
  fieldCount?: number
): string {
  const parts = [`${kind} · ${productLabel}`];
  if (description) parts.push(description);
  else if (fieldCount) parts.push(`${fieldCount} campos`);
  return parts.join(" · ");
}
