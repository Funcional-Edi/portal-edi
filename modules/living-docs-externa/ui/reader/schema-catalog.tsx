import { ArrowRight, Braces, Clock, Database } from "lucide-react";
import Link from "next/link";

import { Badge, environmentBadgeTone } from "@/core/ui/badge";
import { DOCUMENTATION_CONFIGURATION } from "@/modules/living-docs-externa/config/documentation-products";
import { docsGuideHref } from "@/modules/living-docs-externa/services/docs-routes";
import type { SchemaCatalogEntry } from "@/modules/living-docs-externa/services/get-published-schema";

interface SchemaCatalogProps {
  entries: SchemaCatalogEntry[];
}

function formatSyncedAt(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface SchemaCatalogItem {
  entry: SchemaCatalogEntry;
  subproductLabel: string;
}

interface SchemaCatalogGroup {
  id: string;
  label: string;
  description?: string;
  items: SchemaCatalogItem[];
}

function groupByProduct(entries: SchemaCatalogEntry[]): SchemaCatalogGroup[] {
  const relations = new Map(
    DOCUMENTATION_CONFIGURATION.products.flatMap((product) =>
      product.modules.flatMap((module) =>
        module.projectSlug
          ? [[module.projectSlug, { productId: product.id, subproductLabel: module.label }] as const]
          : [],
      ),
    ),
  );
  const groups = new Map<string, SchemaCatalogGroup>(
    DOCUMENTATION_CONFIGURATION.products.map((product) => [product.id, {
      id: product.id,
      label: product.label,
      description: product.description,
      items: [],
    } satisfies SchemaCatalogGroup]),
  );
  const unmatched: SchemaCatalogItem[] = [];

  for (const entry of entries) {
    const relation = relations.get(entry.slug);
    const item = { entry, subproductLabel: relation?.subproductLabel ?? entry.name };
    const group = relation ? groups.get(relation.productId) : undefined;
    if (group) group.items.push(item);
    else unmatched.push(item);
  }

  const result = [...groups.values()].filter((group) => group.items.length > 0);
  if (unmatched.length > 0) {
    result.push({ id: "outros", label: "Outros produtos", items: unmatched });
  }
  return result;
}

function ReadyCard({ item }: { item: SchemaCatalogItem }) {
  const { entry, subproductLabel } = item;
  return (
    <Link
      href={`/docs/api/${entry.slug}`}
      className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-600 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Database className="h-5 w-5" aria-hidden="true" />
        </span>
        {entry.environment ? (
          <Badge tone={environmentBadgeTone(entry.environment)}>{entry.environment}</Badge>
        ) : null}
      </div>

      <h2 className="mt-4 font-semibold text-slate-900">{subproductLabel}</h2>
      {subproductLabel !== entry.name ? (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          {entry.name}
        </p>
      ) : null}
      {entry.description ? (
        <p className="mt-2 flex-1 text-sm text-slate-600">{entry.description}</p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
        {entry.typeCount != null ? (
          <Badge tone="neutral">{entry.typeCount} tipos</Badge>
        ) : null}
        {entry.queryFieldCount != null ? (
          <Badge tone="neutral">{entry.queryFieldCount} queries</Badge>
        ) : null}
        {entry.mutationFieldCount != null ? (
          <Badge tone="neutral">{entry.mutationFieldCount} mutations</Badge>
        ) : null}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Schema sincronizado {formatSyncedAt(entry.syncedAt)}
      </p>

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 group-hover:underline">
        Abrir referência
        <ArrowRight
          className="h-4 w-4 transition group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

function PendingCard({ item }: { item: SchemaCatalogItem }) {
  const { entry, subproductLabel } = item;
  return (
    <div className="flex h-full flex-col rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
          <Clock className="h-5 w-5" aria-hidden="true" />
        </span>
        {entry.environment ? (
          <Badge tone={environmentBadgeTone(entry.environment)}>{entry.environment}</Badge>
        ) : null}
      </div>

      <h2 className="mt-4 font-semibold text-slate-700">{subproductLabel}</h2>
      {subproductLabel !== entry.name ? (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          {entry.name}
        </p>
      ) : null}
      {entry.description ? (
        <p className="mt-2 flex-1 text-sm text-slate-500">{entry.description}</p>
      ) : (
        <div className="flex-1" />
      )}

      <p className="mt-4 text-sm font-medium text-amber-800">Schema pendente de sync</p>
      <p className="mt-1 text-xs text-slate-500">
        Manual publicado, mas o time EDI ainda não sincronizou o schema deste produto.
      </p>

      <Link
        href={docsGuideHref(entry.slug)}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
      >
        Abrir manual curado
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function SchemaCatalog({ entries }: SchemaCatalogProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Braces className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="font-medium text-slate-800">Nenhum manual publicado</p>
        <p className="mt-1 text-sm text-slate-600">
          Quando o time EDI publicar um projeto, ele aparece aqui.
        </p>
      </div>
    );
  }

  const groups = groupByProduct(entries);

  return (
    <div className="space-y-12">
      {groups.map((group) => {
        const ready = group.items.filter((item) => item.entry.hasSchema);
        const pending = group.items.filter((item) => !item.entry.hasSchema);

        return (
          <section key={group.id}>
            <header className="mb-5 border-b border-slate-200 pb-3">
              <h2 className="text-lg font-semibold text-slate-900">{group.label}</h2>
              {group.description ? (
                <p className="mt-1 text-sm text-slate-600">{group.description}</p>
              ) : null}
            </header>

            <div className="space-y-8">
              {ready.length > 0 ? (
                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Schemas disponíveis
                  </h3>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {ready.map((item) => (
                      <li key={item.entry.slug}>
                        <ReadyCard item={item} />
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {pending.length > 0 ? (
                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Pendentes de sync
                  </h3>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {pending.map((item) => (
                      <li key={item.entry.slug}>
                        <PendingCard item={item} />
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
