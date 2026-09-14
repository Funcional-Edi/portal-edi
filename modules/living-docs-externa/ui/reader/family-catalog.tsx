import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

import { Badge, environmentBadgeTone } from "@/core/ui/badge";
import type { ProjectSummary } from "@/modules/living-docs-externa/schema";
import {
  PRODUCT_FAMILY_METADATA,
  type ProductFamily,
} from "@/modules/living-docs-externa/schema/family";
import {
  DOCS_HOME_HREF,
  docsGuideHref,
} from "@/modules/living-docs-externa/services/docs-routes";

interface FamilyCatalogProps {
  family: ProductFamily;
  manuals: ProjectSummary[];
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function FamilyCatalog({ family, manuals }: FamilyCatalogProps) {
  const metadata = PRODUCT_FAMILY_METADATA[family];
  const items = manuals.filter((manual) => manual.family === family);

  return (
    <div>
      <Link
        href={DOCS_HOME_HREF}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Todas as famílias
      </Link>

      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{metadata.name}</h1>
        <p className="mt-2 max-w-2xl text-slate-600">{metadata.description}</p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <BookOpen className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="font-medium text-slate-800">Nenhum manual publicado nesta família</p>
          <p className="mt-1 text-sm text-slate-600">
            Quando o time EDI publicar um produto em {metadata.name}, ele aparece aqui.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((manual) => (
            <li key={manual.slug}>
              <Link
                href={docsGuideHref(manual.slug)}
                className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-600 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <BookOpen className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {manual.environment ? (
                    <Badge tone={environmentBadgeTone(manual.environment)}>
                      {manual.environment}
                    </Badge>
                  ) : null}
                </div>

                <h2 className="mt-4 font-semibold text-slate-900">{manual.name}</h2>
                {manual.description ? (
                  <p className="mt-2 flex-1 text-sm text-slate-600">{manual.description}</p>
                ) : (
                  <div className="flex-1" />
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {manual.gatewaySlug ? (
                    <Badge tone="brand">{manual.gatewaySlug}</Badge>
                  ) : null}
                  <span className="text-xs text-slate-500">
                    Atualizado {formatUpdatedAt(manual.updatedAt)}
                  </span>
                </div>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 group-hover:underline">
                  Abrir roteiro
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
