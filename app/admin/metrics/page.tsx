import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";
import { PlaygroundMetricsPanel } from "@/modules/living-docs-externa/ui/admin/playground-metrics-panel";
import { getPlaygroundMetricsSnapshot } from "@/core/metrics/playground-metrics-store";

export default function AdminMetricsPage() {
  const metrics = getPlaygroundMetricsSnapshot();

  return (
    <AdminShell activeNavHref="/admin/metrics">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Métricas do playground</h1>
        <p className="mt-2 text-slate-600">
          Contagem in-memory de execuções GraphQL bem-sucedidas (MVP — reinicia com o
          processo).
        </p>
      </header>
      <PlaygroundMetricsPanel metrics={metrics} />
    </AdminShell>
  );
}
