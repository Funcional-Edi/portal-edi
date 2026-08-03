import type {
  ManualQualityCheck,
  ManualQualityReport,
} from "@/modules/living-docs-externa/services/manual-quality";

interface QualityChecklistProps {
  report: ManualQualityReport;
}

const STATUS_STYLE: Record<ManualQualityCheck["status"], { badge: string; label: string }> = {
  pass: { badge: "bg-green-50 text-green-800", label: "OK" },
  warn: { badge: "bg-amber-50 text-amber-800", label: "Atenção" },
  fail: { badge: "bg-red-50 text-red-800", label: "Bloqueia" },
};

/** Checklist de qualidade (etapa 6.5) exibido no editor antes de publicar. */
export function QualityChecklist({ report }: QualityChecklistProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Checklist de qualidade</h2>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            report.readyToPublish ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {report.readyToPublish
            ? `Pronto para publicar${report.warnings > 0 ? ` (${report.warnings} atenção)` : ""}`
            : `${report.failed} pendência${report.failed === 1 ? "" : "s"} bloqueando`}
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {report.checks.map((check) => (
          <li key={check.id} className="flex items-start gap-3 text-sm">
            <span
              className={`mt-0.5 inline-flex min-w-[4.5rem] justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
                STATUS_STYLE[check.status].badge
              }`}
            >
              {STATUS_STYLE[check.status].label}
            </span>
            <div>
              <p className="text-slate-800">{check.label}</p>
              {check.detail ? (
                <p className="mt-0.5 text-xs text-slate-600">{check.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
