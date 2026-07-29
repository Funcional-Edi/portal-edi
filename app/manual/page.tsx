import { ManualCatalog } from "@/modules/living-docs-externa/ui/reader/manual-catalog";
import { ManualShell } from "@/modules/living-docs-externa/ui/reader/manual-shell";
import { listPublishedManuals } from "@/modules/living-docs-externa/services/list-published-manuals";

export default async function ManualCatalogPage() {
  const manuals = await listPublishedManuals();

  return (
    <ManualShell>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Manuais de integração</h1>
        <p className="mt-2 text-slate-600">
          Selecione o produto para seguir o roteiro de integração GraphQL curado pelo
          time EDI.
        </p>
      </header>
      <ManualCatalog manuals={manuals} />
    </ManualShell>
  );
}
