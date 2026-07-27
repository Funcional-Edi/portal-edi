import type { ManualSection, Project } from "@/modules/living-docs-externa/schema";
import { sortOperations } from "@/modules/living-docs-externa/schema";
import { MarkdownBody } from "@/modules/living-docs-externa/ui/reader/markdown-body";
import Link from "next/link";

interface ManualRoteiroProps {
  project: Project;
  sections: ManualSection[];
}

export function ManualRoteiro({ project, sections }: ManualRoteiroProps) {
  const { config, manual } = project;
  const operations = sortOperations(manual);

  return (
    <article>
      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-brand-700">Manual de integração</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{manual.title}</h1>
        {manual.productName ? (
          <p className="mt-1 text-lg text-slate-700">{manual.productName}</p>
        ) : null}
        {config.description ? (
          <p className="mt-3 text-slate-600">{config.description}</p>
        ) : null}
        {manual.manualVersion ? (
          <p className="mt-2 text-xs text-slate-500">Versão {manual.manualVersion}</p>
        ) : null}
      </header>

      {sections.length > 0 ? (
        <section id="contexto" className="mb-10 space-y-8 scroll-mt-24">
          <h2 className="text-lg font-semibold">Contexto</h2>
          {sections.map((section) => (
            <div
              key={section.id}
              id={`section-${section.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <MarkdownBody source={section.body} />
            </div>
          ))}
        </section>
      ) : null}

      {manual.referenceTables && manual.referenceTables.length > 0 ? (
        <section id="tabelas-referencia" className="mb-10 scroll-mt-24">
          <h2 className="mb-4 text-lg font-semibold">Tabelas de referência</h2>
          <div className="space-y-6">
            {manual.referenceTables.map((table) => (
              <div key={table.id}>
                <h3 className="mb-2 font-medium">{table.title}</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {table.columns.map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 text-left font-medium text-slate-700"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-slate-100">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 text-slate-600">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section id="roteiro-integracao" className="scroll-mt-24">
        <h2 className="mb-4 text-lg font-semibold">Roteiro de integração</h2>
        <ol className="space-y-4">
          {operations.map((op) => (
            <li key={`${op.kind}-${op.name}`}>
              <Link
                href={`/manual/${config.slug}/operations/${op.kind}/${op.name}`}
                className="block rounded-lg border border-slate-200 p-4 transition hover:border-brand-600"
              >
                <span className="text-xs font-medium uppercase text-brand-700">
                  {op.kind}
                </span>
                <h3 className="mt-1 font-semibold">
                  {op.title ?? `${op.kind} ${op.name}`}
                </h3>
                {op.description ? (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {op.description}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
