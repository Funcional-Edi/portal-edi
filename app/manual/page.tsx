import { ManualCatalog } from "@/modules/living-docs-externa/ui/reader/manual-catalog";
import { ManualShell } from "@/modules/living-docs-externa/ui/reader/manual-shell";
import { listPublishedManuals } from "@/modules/living-docs-externa/services/list-published-manuals";

export default async function ManualCatalogPage() {
  const manuals = await listPublishedManuals();

  return (
    <ManualShell
      navItems={[{ href: "/manual", label: "Catálogo", active: true }]}
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Manuais de integração
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Selecione o produto para seguir o roteiro de integração GraphQL curado
          pelo time EDI.
        </p>
      </header>
      <ManualCatalog manuals={manuals} />
    </ManualShell>
  );
}
