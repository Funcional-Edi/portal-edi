import { AppShell } from "@/core/ui/app-shell";
import { SessionActions } from "@/core/ui/session-actions";
import { FAQ_HREF, DOCS_NAV_ITEMS } from "@/modules/living-docs-externa/services/docs-routes";
import { listPublishedFaq } from "@/modules/faq/services/list-faq";
import { FaqBrowser } from "@/modules/faq/ui/faq-browser";

export default async function FaqPage() {
  const entries = await listPublishedFaq();
  const navItems = DOCS_NAV_ITEMS.map((item) => ({
    ...item,
    active: item.href === FAQ_HREF,
  }));

  return (
    <AppShell subtitle="FAQ de integração" navItems={navItems} actions={<SessionActions />}>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Dúvidas frequentes</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">FAQ de Integração</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Encontre orientações sobre produtos, subprodutos, ambientes e etapas do processo de integração.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            As respostas apontam para a documentação publicada e não substituem o roteiro de homologação do produto.
          </p>
        </header>
        <FaqBrowser entries={entries} />
      </main>
    </AppShell>
  );
}
