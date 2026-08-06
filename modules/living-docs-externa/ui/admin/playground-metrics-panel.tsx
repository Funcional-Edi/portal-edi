import type { PlaygroundMetricsSnapshot } from "@/core/metrics/playground-metrics-store";

interface PlaygroundMetricsPanelProps {
  metrics: PlaygroundMetricsSnapshot;
}

export function PlaygroundMetricsPanel({ metrics }: PlaygroundMetricsPanelProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {metrics.totalExecutions}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase text-slate-500">Últimas 24h</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {metrics.last24hExecutions}
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Por operação</h2>
        {metrics.byOperation.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Nenhuma execução registrada ainda.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium text-slate-700">Projeto</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Operação</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Total</th>
                  <th className="px-3 py-2 font-medium text-slate-700">24h</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Última exec.</th>
                </tr>
              </thead>
              <tbody>
                {metrics.byOperation.map((row) => (
                  <tr key={`${row.slug}-${row.operationKind}-${row.operationName}`} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{row.slug}</td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs text-slate-600">{row.operationKind}</span>{" "}
                      {row.operationName}
                    </td>
                    <td className="px-3 py-2">{row.total}</td>
                    <td className="px-3 py-2">{row.last24h}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {row.lastExecutedAt
                        ? new Date(row.lastExecutedAt).toLocaleString("pt-BR")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Por projeto</h2>
        {metrics.byProject.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">—</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {metrics.byProject.map((project) => (
              <li
                key={project.slug}
                className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm"
              >
                <span className="font-mono">{project.slug}</span>
                <span className="text-slate-600">
                  {project.total} total · {project.last24h} (24h)
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
