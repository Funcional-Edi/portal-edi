import { BookOpen, Check, ClipboardCheck, Info, KeyRound, Route } from "lucide-react";

import { Badge } from "@/core/ui/badge";
import type { DocumentationProductView } from "@/modules/living-docs-externa/schema/documentation-navigation";
import { DocumentationStatusBadge } from "@/modules/living-docs-externa/ui/reader/documentation-status";

const JOURNEY = [
  { icon: BookOpen, title: "Entenda o produto", description: "Identifique o módulo e leia o contexto, as regras e o objetivo da integração." },
  { icon: KeyRound, title: "Prepare o acesso", description: "Confirme o ambiente, os endpoints e as credenciais com o time responsável." },
  { icon: Route, title: "Siga o roteiro", description: "Consulte a sequência das operações, seus pré-requisitos e os fluxogramas disponíveis." },
  { icon: ClipboardCheck, title: "Valide os cenários", description: "Compare os retornos esperados e registre as evidências para alinhar a homologação." },
];

const PREPARATION = [
  { title: "Objetivo e escopo", description: "Qual processo será integrado e quem acompanha a implantação." },
  { title: "Ambiente e credenciais", description: "Endereço da API e acesso ao ambiente correto, confirmados com o time responsável." },
  { title: "Dados para validação", description: "Cenários e dados de teste adequados às regras do produto." },
  { title: "Registro dos resultados", description: "Retornos, identificadores e evidências para investigar dúvidas durante a integração." },
];

/** Editorial introduction only: actual availability and audience come from the navigation service. */
export function DocumentationIntroduction({ products }: { products: DocumentationProductView[] }) {
  return (
    <div className="space-y-9">
      <header className="relative overflow-hidden rounded-2xl bg-brand-900 px-6 py-8 text-white sm:px-8 sm:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[32px] border-white/5" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">Seu ponto de partida</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Documentação</h1>
          <p className="mt-4 text-lg leading-relaxed text-brand-50">Do entendimento do produto à primeira integração.</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-100">
            Conheça os conceitos, prepare seu ambiente e siga uma trilha de implementação.
            Quando estiver pronto, escolha um produto no menu para consultar seus módulos e roteiros.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-brand-50">
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
            Visão geral · comece pelo menu de produtos
          </div>
        </div>
      </header>

      <section aria-labelledby="journey-title">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Uma etapa de cada vez</p>
        <h2 id="journey-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Sua trilha de integração</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">Um caminho de referência. O roteiro de cada produto detalha as etapas e suas particularidades.</p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {JOURNEY.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-brand-700" aria-hidden="true" />
                <span className="font-mono text-xs font-medium text-slate-400">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="preparation-title" className="grid gap-6 rounded-xl border border-brand-100 bg-brand-50/50 p-6 xl:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 id="preparation-title" className="text-xl font-semibold tracking-tight text-slate-900">Antes de começar</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Tenha o contexto e os acessos em mãos para percorrer o roteiro com menos interrupções.</p>
          <p className="mt-4 text-xs leading-relaxed text-slate-600">O login no portal e as credenciais da API são acessos distintos.</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PREPARATION.map((item) => (
            <li key={item.title} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="products-overview-title">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Contexto dos produtos</p>
          <h2 id="products-overview-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-900">O que você encontra por aqui</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Uma visão inicial para orientar sua escolha. A documentação será ampliada conforme os conteúdos forem publicados.</p>
        </div>
        {products.length ? (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-5 sm:px-6">
            {products.map((product) => (
              <li key={product.id} className="grid gap-2 py-5 xl:grid-cols-[12rem_minmax(0,1fr)] xl:gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{product.label}</h3>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <DocumentationStatusBadge status={product.status} />
                    {product.tag ? <Badge>{product.tag}</Badge> : null}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>
              </li>
            ))}
          </ul>
        ) : <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Nenhum produto disponível para seu acesso neste momento.</p>}
      </section>

      <aside aria-label="Ambiente de integração" className="flex items-start gap-3 rounded-xl border border-slate-200 p-5">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Confira o ambiente antes de integrar</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">A tag <strong>homolog</strong> identifica o ambiente do manual; não significa que a integração já foi homologada.</p>
        </div>
      </aside>
    </div>
  );
}
