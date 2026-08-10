import { Badge } from "@/core/ui/badge";
import type { ComplianceReport } from "@/modules/compliance/services/get-compliance-report";

interface ComplianceDashboardProps {
  report: ComplianceReport;
}

function StatusBadge({ ok }: { ok: boolean }) {
  return <Badge tone={ok ? "success" : "warning"}>{ok ? "OK" : "Atenção"}</Badge>;
}

export function ComplianceDashboard({ report }: ComplianceDashboardProps) {
  const allRuntimeOk = report.runtimeChecks.every((check) => check.ok);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-medium text-brand-700">Proteção de dados e confidencialidade</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Painel de Compliance
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Controles implementados no portal para garantir confidencialidade, integridade e
          conformidade. Atualize{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
            modules/compliance/data/controls.ts
          </code>{" "}
          ao adicionar novos controles.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Última revisão do catálogo: {report.lastUpdated}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Controles</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {report.summary.activeControls}/{report.summary.totalControls}
          </p>
          <p className="mt-1 text-sm text-slate-600">ativos no catálogo</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Runtime</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {report.summary.runtimeOk}/{report.summary.runtimeTotal}
          </p>
          <p className="mt-1 text-sm text-slate-600">checagens OK agora</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">RBAC</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{report.permissionsSource}</p>
          <p className="mt-1 text-sm text-slate-600">fonte de permissões</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ambiente</p>
          <div className="mt-2">
            <StatusBadge ok={allRuntimeOk} />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {allRuntimeOk ? "Sem alertas de runtime." : "Revise as checagens abaixo."}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Checagens em runtime</h2>
        <ul className="space-y-2">
          {report.runtimeChecks.map((check) => (
            <li
              key={check.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{check.id}</p>
                <p className="mt-0.5 text-sm text-slate-600">{check.detail}</p>
              </div>
              <StatusBadge ok={check.ok} />
            </li>
          ))}
        </ul>
      </section>

      {report.categories.map((category) => (
        <section key={category.id}>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{category.label}</h2>
          <div className="space-y-3">
            {category.controls.map((control) => (
              <article
                key={control.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-900">{control.title}</h3>
                  <Badge tone={control.status === "ativo" ? "success" : "warning"}>
                    {control.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{control.description}</p>
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-slate-700">Como verificar</dt>
                    <dd className="mt-0.5 text-slate-600">{control.verification}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700">Referência</dt>
                    <dd className="mt-0.5 font-mono text-xs text-slate-600">{control.reference}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-slate-400">
                  Implementado em {control.implementedAt}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-xl border border-brand-200 bg-brand-50 p-5">
        <h2 className="font-semibold text-brand-900">Como manter atualizado</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-brand-900">
          <li>
            Ao implementar um novo controle de segurança, adicione entrada em{" "}
            <code className="rounded bg-white/70 px-1">modules/compliance/data/controls.ts</code>.
          </li>
          <li>
            Se a checagem for automática, estenda{" "}
            <code className="rounded bg-white/70 px-1">
              modules/compliance/services/get-compliance-report.ts
            </code>{" "}
            ou <code className="rounded bg-white/70 px-1">core/security/production-checks.ts</code>.
          </li>
          <li>
            Atualize a regra{" "}
            <code className="rounded bg-white/70 px-1">.cursor/rules/seguranca-dados.mdc</code>{" "}
            com o padrão correto a seguir.
          </li>
        </ol>
      </section>
    </div>
  );
}
