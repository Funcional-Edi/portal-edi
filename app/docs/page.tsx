import { FamilyPicker } from "@/modules/living-docs-externa/ui/reader/family-picker";
import { DocsShell } from "@/modules/living-docs-externa/ui/reader/docs-shell";
import { DOCS_HOME_HREF } from "@/modules/living-docs-externa/services/docs-routes";

export default function DocsHomePage() {
  return (
    <DocsShell activeHref={DOCS_HOME_HREF}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Documentação</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Escolha a família de produto para acessar os manuais de integração GraphQL curados
          pelo time EDI.
        </p>
      </header>
      <FamilyPicker />
    </DocsShell>
  );
}
