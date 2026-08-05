import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileText,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { AppShell } from "@/core/ui/app-shell";
import { Badge } from "@/core/ui/badge";
import { SessionActions } from "@/core/ui/session-actions";
import { registerAllModules, listBlockedModules } from "@/modules/registry";

/**
 * Landing = "planta viva" do portal: a lista de módulos é DERIVADA do
 * module-registry (não escrita à mão). Ao adicionar um módulo, ele aparece aqui
 * automaticamente. Módulos bloqueados por falta de banco ficam sinalizados.
 */

const MODULE_ICONS: Record<string, LucideIcon> = {
  "living-docs-externa": BookOpen,
  "manuais-internos": FileText,
  fluxogramas: Workflow,
  homologacao: ClipboardCheck,
  "assistente-ia": Sparkles,
};

export default function HomePage() {
  const modules = registerAllModules();
  const blocked = new Map(
    listBlockedModules().map((entry) => [entry.module.id, entry.missing])
  );

  const activeModules = modules.filter((m) => m.status === "active");
  const plannedModules = modules.filter((m) => m.status !== "active");

  return (
    <AppShell
      subtitle="Fundação modular"
      navItems={[{ href: "/manual", label: "Documentação Viva" }]}
      actions={<SessionActions />}
    >
      <main className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-10">
          <p className="text-sm font-medium text-brand-700">Time EDI / Tecnologia</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Portal de Integração
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Fundação modular rodando. Cada módulo abaixo é um contexto isolado,
            registrado na fundação. Esta lista é gerada do código — não desenhada à
            mão.
          </p>
        </header>

        {activeModules.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Em produção
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {activeModules.map((module) => {
                const Icon = MODULE_ICONS[module.id] ?? BookOpen;
                return (
                  <Link
                    key={module.id}
                    href={module.basePath}
                    className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-600 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <Badge tone="success">ativo</Badge>
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-900">{module.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{module.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 group-hover:underline">
                      Abrir
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {plannedModules.length > 0 ? (
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Planejados
            </h2>
            <ul className="space-y-2">
              {plannedModules.map((module) => {
                const Icon = MODULE_ICONS[module.id] ?? FileText;
                const missing = blocked.get(module.id);
                return (
                  <li
                    key={module.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-slate-900">{module.title}</span>
                        <Badge>planejado</Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600">{module.description}</p>
                      {missing && missing.length > 0 ? (
                        <p className="mt-1.5 text-xs text-amber-700">
                          Bloqueado — exige banco: {missing.join(", ")} (ver ADR-0002)
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </main>
    </AppShell>
  );
}
