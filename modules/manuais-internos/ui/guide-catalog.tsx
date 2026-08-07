import Link from "next/link";

import type { InternoGuideSummary } from "@/modules/manuais-internos/schema/guide";

interface GuideCatalogProps {
  guides: InternoGuideSummary[];
}

export function GuideCatalog({ guides }: GuideCatalogProps) {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Guias internos</h1>
        <p className="mt-2 text-slate-600">
          Processos, regras e conhecimento operacional do time EDI.
        </p>
      </header>

      {guides.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
          Nenhum guia publicado em <code>content/interno/guides/</code> ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/interno/${guide.slug}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand-600"
              >
                <h2 className="font-semibold text-slate-900">{guide.title}</h2>
                <p className="mt-1 font-mono text-xs text-slate-500">{guide.slug}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
