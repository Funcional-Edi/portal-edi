import Link from "next/link";

import { Badge } from "@/core/ui/badge";
import type { ManualOperation } from "@/modules/living-docs-externa/schema";
import type { PublishedSchemaReference } from "@/modules/living-docs-externa/services/get-published-schema";
import { schemaTypeHref } from "@/modules/living-docs-externa/services/get-published-schema";
import type { SchemaFieldRef } from "@/modules/living-docs-externa/services/schema-reference";
import { schemaFieldAnchor } from "@/modules/living-docs-externa/services/schema-reference";

interface SchemaReferenceViewProps {
  data: PublishedSchemaReference;
}

function formatSyncedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("pt-BR");
}

function manualLinkForField(
  slug: string,
  kind: "query" | "mutation",
  name: string,
  operations: ManualOperation[]
): string | null {
  const match = operations.find((op) => op.kind === kind && op.name === name);
  if (!match) return null;
  return `/manual/${slug}/operations/${kind}/${name}`;
}

function FieldTable({
  slug,
  kind,
  title,
  fields,
  operations,
}: {
  slug: string;
  kind: "query" | "mutation";
  title: string;
  fields: SchemaFieldRef[];
  operations: ManualOperation[];
}) {
  if (fields.length === 0) {
    return (
      <section id={kind === "query" ? "queries" : "mutations"} className="scroll-mt-24">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">Nenhum campo raiz neste schema.</p>
      </section>
    );
  }

  return (
    <section id={kind === "query" ? "queries" : "mutations"} className="scroll-mt-24">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Campo</th>
              <th className="px-4 py-2.5">No manual</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => {
              const manualHref = manualLinkForField(slug, kind, field.name, operations);
              return (
                <tr key={field.name} id={schemaFieldAnchor(kind, field.name)} className="border-t border-slate-100 scroll-mt-24">
                  <td className="px-4 py-3">
                    <p className="font-mono text-brand-800">{field.name}</p>
                    {field.description ? (
                      <p className="mt-1 text-slate-600">{field.description}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {manualHref ? (
                      <Link
                        href={manualHref}
                        className="text-sm font-medium text-brand-700 hover:underline"
                      >
                        Ver no roteiro
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-500" title="Existe no gateway, mas não foi curado no manual">
                        Não curado
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SchemaReferenceView({ data }: SchemaReferenceViewProps) {
  const { project, snapshot, reference } = data;
  const operations = project.manual.operations;

  return (
    <article>
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/docs/api" className="hover:text-brand-700">
          Referência API
        </Link>
        <span className="mx-2">/</span>
        <span>{project.config.name}</span>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-xs font-medium uppercase text-brand-700">Schema GraphQL</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{project.config.name}</h1>
        <p className="mt-2 font-mono text-sm text-slate-500 break-all">
          {snapshot.source.graphqlUrl}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="neutral">{reference.types.length} tipos</Badge>
          <Badge tone="neutral">{reference.queries.length} queries</Badge>
          <Badge tone="neutral">{reference.mutations.length} mutations</Badge>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Sincronizado em {formatSyncedAt(snapshot.syncedAt)} · snapshot read-only (sem
          introspection live)
        </p>
        <div className="mt-4">
          <Link
            href={`/manual/${project.config.slug}`}
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            Abrir manual curado →
          </Link>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Seções
            </p>
            <ul className="space-y-1.5 text-sm">
              <li>
                <a href="#queries" className="text-slate-700 hover:text-brand-700">
                  Queries
                </a>
              </li>
              <li>
                <a href="#mutations" className="text-slate-700 hover:text-brand-700">
                  Mutations
                </a>
              </li>
              <li>
                <a href="#types" className="text-slate-700 hover:text-brand-700">
                  Tipos
                </a>
              </li>
            </ul>
          </div>
        </aside>

        <div className="space-y-10">
          <FieldTable
            slug={project.config.slug}
            kind="query"
            title={
              reference.queryTypeName
                ? `Queries (${reference.queryTypeName})`
                : "Queries"
            }
            fields={reference.queries}
            operations={operations}
          />
          <FieldTable
            slug={project.config.slug}
            kind="mutation"
            title={
              reference.mutationTypeName
                ? `Mutations (${reference.mutationTypeName})`
                : "Mutations"
            }
            fields={reference.mutations}
            operations={operations}
          />

          <section id="types" className="scroll-mt-24">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Tipos</h2>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Nome</th>
                    <th className="px-4 py-2.5">Kind</th>
                    <th className="px-4 py-2.5">Campos</th>
                  </tr>
                </thead>
                <tbody>
                  {reference.types.map((type) => (
                    <tr key={type.name} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <Link
                          href={schemaTypeHref(project.config.slug, type.name)}
                          className="font-mono text-brand-700 hover:underline"
                        >
                          {type.name}
                        </Link>
                        {type.description ? (
                          <p className="mt-1 text-slate-600">{type.description}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{type.kind}</td>
                      <td className="px-4 py-3 text-slate-600">{type.fieldCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
