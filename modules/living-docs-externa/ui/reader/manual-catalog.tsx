import type { ProjectSummary } from "@/modules/living-docs-externa/schema";
import Link from "next/link";

interface ManualCatalogProps {
  manuals: ProjectSummary[];
}

export function ManualCatalog({ manuals }: ManualCatalogProps) {
  if (manuals.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
        Nenhum manual publicado no momento.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {manuals.map((manual) => (
        <li key={manual.slug}>
          <Link
            href={`/manual/${manual.slug}`}
            className="block rounded-lg border border-slate-200 p-5 transition hover:border-brand-600 hover:shadow-sm"
          >
            <h2 className="font-semibold text-slate-900">{manual.name}</h2>
            {manual.description ? (
              <p className="mt-2 text-sm text-slate-600">{manual.description}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              {manual.environment ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5">
                  {manual.environment}
                </span>
              ) : null}
              {manual.gatewaySlug ? (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700">
                  {manual.gatewaySlug}
                </span>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
