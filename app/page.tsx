import Link from "next/link";
import Image from "next/image";
import { Suspense, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Code2,
  FileText,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { auth } from "@/core/auth";
import { canAccessLevel, canAccessModule } from "@/core/auth/module-access";
import { env } from "@/core/config/env";
import { AppShell } from "@/core/ui/app-shell";
import { Badge } from "@/core/ui/badge";
import { SessionActions } from "@/core/ui/session-actions";
import { registerAllModules } from "@/modules/registry";

import { LoginForm } from "./login/login-form";

import functionalLogoWhite from "@/img/Logotipo branco.png";

const MODULE_ICONS: Record<string, LucideIcon> = {
  "living-docs-externa": BookOpen,
  "graphql-reference": Code2,
  "manuais-internos": FileText,
  fluxogramas: Workflow,
  homologacao: ClipboardCheck,
  "assistente-ia": Sparkles,
  compliance: ShieldCheck,
};

function PortalIntroduction({ children }: { children?: ReactNode }) {
  return (
    <header className="relative overflow-hidden rounded-2xl bg-brand-900 px-6 py-9 text-white sm:p-10">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full border-[40px] border-white/5" />
      <div className="relative">
        <Image
          src={functionalLogoWhite}
          alt="Funcional"
          width={160}
          height={90}
          priority
          className="-ml-6 -mt-8 h-24 w-56 object-contain object-left"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">Conexões que começam com informação</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Portal de Integração</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-50">Um ponto de encontro para entender os produtos EDI e construir sua integração.</p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-100">Consulte a documentação, entenda os processos nos fluxogramas e organize a implementação e a validação com os roteiros de cada produto.</p>
        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-brand-50">
          <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4" aria-hidden="true" />Produtos e documentação</span>
          <span className="inline-flex items-center gap-2"><Workflow className="h-4 w-4" aria-hidden="true" />Fluxos de integração</span>
          <span className="inline-flex items-center gap-2"><ClipboardCheck className="h-4 w-4" aria-hidden="true" />Roteiros e validação</span>
        </div>
        {children}
      </div>
    </header>
  );
}

function LoginShell() {
  return (
    <AppShell subtitle="Integrações EDI">
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col justify-center px-4 py-8 sm:px-6">
        <section aria-labelledby="login-title" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <ShieldCheck className="h-6 w-6 text-brand-700" aria-hidden="true" />
          <h1 id="login-title" className="mt-3 text-2xl font-semibold text-slate-900">Entre para continuar</h1>
          <p className="mb-6 mt-2 text-sm leading-relaxed text-slate-600">Entre para consultar a documentação e acompanhar os roteiros de integração.</p>
          <Suspense fallback={<p className="text-sm text-slate-500">Carregando…</p>}>
            <LoginForm ssoConfigured={env.isSsoConfigured} devAuthEnabled={env.isDevAuthEnabled} />
          </Suspense>
        </section>
      </main>
    </AppShell>
  );
}

/** Same portal for every audience; the module registry remains the authority for access. */
export default async function HomePage() {
  const session = await auth();
  if (!session?.user) return <LoginShell />;

  const role = session.user.role ?? "client";
  const isAdmin = role === "admin";
  const accessibleModules = registerAllModules().filter((module) => canAccessModule(role, module));
  const activeModules = accessibleModules.filter((module) => module.status === "active");
  const plannedModules = isAdmin ? accessibleModules.filter((module) => module.status !== "active") : [];
  const allowedNav = activeModules.flatMap((module) => module.nav ?? [])
    .filter((item) => !item.access || canAccessLevel(role, item.access));
  const uniqueNav = allowedNav.filter((item, index, list) => list.findIndex((entry) => entry.href === item.href) === index);
  const docsEntry = uniqueNav.find((item) => item.href === "/docs");

  return (
    <AppShell subtitle="Integrações EDI" navItems={uniqueNav} actions={<SessionActions />}>
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:py-12">
        <PortalIntroduction>
          {docsEntry ? (
            <Link href={docsEntry.href} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900">
              Começar pela documentação <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null}
        </PortalIntroduction>

        {activeModules.length ? (
          <section aria-labelledby="resources-title">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Explore o portal</p>
            <h2 id="resources-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Recursos para sua integração</h2>
            <p className="mt-2 text-sm text-slate-600">Encontre a documentação e as ferramentas para cada etapa da integração.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeModules.map((module) => {
                const Icon = MODULE_ICONS[module.id] ?? BookOpen;
                const entry = module.nav?.find((item) => !item.access || canAccessLevel(role, item.access));
                return (
                  <Link key={module.id} href={entry?.href ?? module.basePath} className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <h3 className="mt-4 font-semibold text-slate-900">{module.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{module.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-700">Explorar <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="start-title" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 id="start-title" className="text-xl font-semibold tracking-tight text-slate-900">Da documentação à validação</h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              { title: "Escolha o contexto", text: "Identifique o produto, leia suas regras e entenda quais processos fazem parte da integração." },
              { title: "Implemente com um roteiro", text: "Use a sequência de operações, os exemplos e os fluxogramas publicados para orientar o desenvolvimento." },
              { title: "Teste e alinhe os resultados", text: "Valide no ambiente acordado, registre as evidências e combine os próximos passos com o time responsável." },
            ].map((step, index) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 font-mono text-xs font-semibold text-brand-700">{index + 1}</span>
                <div><h3 className="text-sm font-semibold text-slate-900">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p></div>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">O acompanhamento de homologação no portal ainda está planejado; siga as orientações do time responsável pelo produto.</p>
        </section>

        {plannedModules.length ? (
          <section aria-labelledby="planned-title" className="border-t border-slate-200 pt-8">
            <h2 id="planned-title" className="text-sm font-semibold text-slate-700">Em evolução · equipe EDI</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {plannedModules.map((module) => (
                <li key={module.id} className="rounded-lg border border-dashed border-slate-300 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-medium text-slate-800">{module.title}</h3><Badge>planejado</Badge></div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{module.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {isAdmin ? (
          <Link href="/admin/projects" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-brand-700 transition hover:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
            Administração de projetos <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </main>
    </AppShell>
  );
}
