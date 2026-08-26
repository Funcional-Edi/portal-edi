import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileText,
  LayoutGrid,
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
import { registerAllModules, listBlockedModules } from "@/modules/registry";

import { LoginForm } from "./login/login-form";

/**
 * Porta única do portal:
 * - Deslogado → login inline (SSO / dev)
 * - Client → hub mínimo (módulos access: any)
 * - Admin → hub EDI completo (ativos + planejados internos)
 */

const MODULE_ICONS: Record<string, LucideIcon> = {
  "living-docs-externa": BookOpen,
  "manuais-internos": FileText,
  fluxogramas: Workflow,
  homologacao: ClipboardCheck,
  "assistente-ia": Sparkles,
  compliance: ShieldCheck,
};

function LoginShell() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <header className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-700 text-white">
          <LayoutGrid className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-brand-700">Portal de Integração</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Acesso aos manuais de integração (SSO ou login dev local).
        </p>
      </header>
      <Suspense fallback={<p className="text-center text-sm text-slate-500">Carregando…</p>}>
        <LoginForm
          ssoConfigured={env.isSsoConfigured}
          devAuthEnabled={env.isDevAuthEnabled}
        />
      </Suspense>
    </main>
  );
}

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return <LoginShell />;
  }

  const role = session.user.role ?? "client";
  const isAdmin = role === "admin";
  const modules = registerAllModules();
  const blocked = new Map(
    listBlockedModules().map((entry) => [entry.module.id, entry.missing])
  );

  const accessibleModules = modules.filter((module) => canAccessModule(role, module));
  const activeModules = accessibleModules.filter((module) => module.status === "active");
  const plannedModules = isAdmin
    ? accessibleModules.filter((module) => module.status !== "active")
    : [];

  const navItems = activeModules
    .flatMap((module) => module.nav ?? [])
    .filter((item) => !item.access || canAccessLevel(role, item.access))
    .map((item) => ({ href: item.href, label: item.label }));

  const uniqueNav = navItems.filter(
    (item, index, list) => list.findIndex((entry) => entry.href === item.href) === index
  );

  return (
    <AppShell
      subtitle={isAdmin ? "Time EDI / Tecnologia" : "Integração"}
      navItems={uniqueNav.length > 0 ? uniqueNav : [{ href: "/docs", label: "Documentação" }]}
      actions={<SessionActions />}
    >
      <main className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-10">
          <p className="text-sm font-medium text-brand-700">
            {isAdmin ? "Time EDI / Tecnologia" : "Portal do distribuidor"}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Portal de Integração
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            {isAdmin
              ? "Fundação modular rodando. Cada módulo abaixo é um contexto isolado, registrado na fundação."
              : "Acesse os manuais e recursos disponíveis para integração."}
          </p>
        </header>

        {activeModules.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {isAdmin ? "Em produção" : "Disponível"}
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
                      <ArrowRight
                        className="h-4 w-4 transition group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
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

        {isAdmin ? (
          <section className="mt-10">
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-600 hover:text-brand-700"
            >
              Administração de projetos
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        ) : null}
      </main>
    </AppShell>
  );
}
