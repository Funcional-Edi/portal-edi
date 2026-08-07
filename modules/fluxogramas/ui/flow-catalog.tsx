import Link from "next/link";

import type { PublishedFlowSummary } from "@/modules/fluxogramas/repository/flow-repository";

interface FlowCatalogProps {
  flows: PublishedFlowSummary[];
}

export function FlowCatalog({ flows }: FlowCatalogProps) {
  if (flows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
        Nenhum fluxograma publicado ainda. O time EDI pode criar um em{" "}
        <code>content/projects/&#123;slug&#125;/flow.json</code> pelo admin.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {flows.map((flow) => (
        <li key={flow.slug}>
          <Link
            href={`/fluxogramas/${flow.slug}`}
            className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-600 hover:shadow-md"
          >
            <p className="text-sm font-medium text-brand-700">{flow.flowTitle}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{flow.name}</h2>
            {flow.description ? (
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{flow.description}</p>
            ) : null}
            <span className="mt-4 inline-block text-sm font-medium text-brand-700">
              Ver fluxograma →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
