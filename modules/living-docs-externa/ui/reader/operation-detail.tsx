import type { ManualOperation } from "@/modules/living-docs-externa/schema";
import Link from "next/link";

interface OperationDetailProps {
  slug: string;
  manualTitle: string;
  operation: ManualOperation;
}

export function OperationDetail({
  slug,
  manualTitle,
  operation,
}: OperationDetailProps) {
  return (
    <article>
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/manual" className="hover:text-brand-700">
          Manuais
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/manual/${slug}`} className="hover:text-brand-700">
          {manualTitle}
        </Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-6">
        <span className="text-xs font-medium uppercase text-brand-700">
          {operation.kind}
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {operation.title ?? operation.name}
        </h1>
        <p className="mt-1 font-mono text-sm text-slate-500">{operation.name}</p>
      </header>

      {operation.description ? (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            Descrição
          </h2>
          <p className="text-slate-700">{operation.description}</p>
        </section>
      ) : null}

      {operation.businessNotes && operation.businessNotes.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            Regras de negócio
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-slate-700">
            {operation.businessNotes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {operation.exampleQuery ? (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            Exemplo GraphQL
          </h2>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
            <code>{operation.exampleQuery}</code>
          </pre>
        </section>
      ) : null}

      <footer className="mt-8">
        <Link
          href={`/manual/${slug}`}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          ← Voltar ao roteiro
        </Link>
      </footer>
    </article>
  );
}
