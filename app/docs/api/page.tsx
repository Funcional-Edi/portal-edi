import { listPublishedSchemaCatalog } from "@/modules/living-docs-externa/services/get-published-schema";
import { DocsApiShell } from "@/modules/living-docs-externa/ui/reader/docs-api-shell";
import { SchemaCatalog } from "@/modules/living-docs-externa/ui/reader/schema-catalog";

export default async function DocsApiCatalogPage() {
  const entries = await listPublishedSchemaCatalog();

  return (
    <DocsApiShell activeHref="/docs/api">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Referência GraphQL
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Schema técnico completo por produto, gerado a partir do sync do admin. Complementa
          o manual curado — leitura only, sem introspection live no browser.
        </p>
      </header>
      <SchemaCatalog entries={entries} />
    </DocsApiShell>
  );
}
