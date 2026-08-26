import type { ManualOperation, ManualSection, Project } from "@/modules/living-docs-externa/schema";
import { sortOperations } from "@/modules/living-docs-externa/schema";
import { buildPlaygroundHref } from "@/modules/living-docs-externa/services/playground-access";
import { docsOperationHref } from "@/modules/living-docs-externa/services/docs-routes";
import { MarkdownBody } from "@/modules/living-docs-externa/ui/reader/markdown-body";
import { ProjectExportActions } from "@/modules/living-docs-externa/ui/shared/export-buttons";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Pontos de extensão do modo admin (etapa 6.1/6.2). Existem para que o editor
 * e a visão do distribuidor compartilhem UM layout só: o admin injeta controles
 * nos mesmos cards que o distribuidor vê, em vez de haver uma segunda tela.
 */
export interface ManualRoteiroEditorSlots {
  /** Substitui o corpo Markdown da seção (editor inline). */
  renderSectionBody?: (section: ManualSection) => ReactNode;
  /** Controles no card da seção (editar, remover). */
  renderSectionActions?: (section: ManualSection) => ReactNode;
  /** Controles no card da operação (abrir slide-over, remover). */
  renderOperationActions?: (operation: ManualOperation) => ReactNode;
  /** Link para fluxograma (modo admin). */
  flowHref?: string;
  /** Substitui o link de playground no cabeçalho. */
  headerActions?: ReactNode;
  /** Faixa acima do manual (status, checklist de qualidade). */
  banner?: ReactNode;
  /** Ações do bloco "Contexto" (nova seção). */
  sectionsToolbar?: ReactNode;
  /** Ações do bloco "Roteiro de integração" (nova operação). */
  operationsToolbar?: ReactNode;
}

interface ManualRoteiroProps {
  project: Project;
  sections: ManualSection[];
  /** Ausente = visão do distribuidor (somente leitura). */
  editor?: ManualRoteiroEditorSlots;
  /** Link para fluxograma quando `flow.json` existe. */
  flowHref?: string;
  /** Link para referência GraphQL quando schema sincronizado. */
  schemaReferenceHref?: string;
  /** Playground executa contra gateway real — só perfil admin. */
  canUsePlayground?: boolean;
}

export function ManualRoteiro({
  project,
  sections,
  editor,
  flowHref,
  schemaReferenceHref,
  canUsePlayground = false,
}: ManualRoteiroProps) {
  const { config, manual } = project;
  const operations = sortOperations(manual);
  const isEditing = editor != null;
  const showContext = sections.length > 0 || isEditing;

  return (
    <article>
      {editor?.banner ? <div className="mb-6">{editor.banner}</div> : null}

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
        <div className="mt-4 flex flex-wrap gap-3">
          {editor?.headerActions ?? (
            <>
              {canUsePlayground ? (
                <Link
                  href={buildPlaygroundHref(config.slug)}
                  className="inline-flex items-center rounded-md border border-brand-700 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  Abrir playground GraphQL
                </Link>
              ) : null}
              {flowHref ?? editor?.flowHref ? (
                <Link
                  href={flowHref ?? editor!.flowHref!}
                  className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ver fluxograma
                </Link>
              ) : null}
              {schemaReferenceHref ? (
                <Link
                  href={schemaReferenceHref}
                  className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ver referência GraphQL
                </Link>
              ) : null}
              <ProjectExportActions
                slug={config.slug}
                graphqlUrl={config.graphqlUrl}
              />
            </>
          )}
        </div>
      </header>

      {showContext ? (
        <section id="contexto" className="mb-10 space-y-8 scroll-mt-24">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Contexto</h2>
            {editor?.sectionsToolbar}
          </div>

          {sections.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
              Nenhuma seção de contexto ainda. O distribuidor abriria o manual direto no
              roteiro.
            </p>
          ) : null}

          {sections.map((section) => (
            <div
              key={section.id}
              id={`section-${section.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              {editor?.renderSectionActions ? (
                <div className="mb-3 flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="font-mono text-xs text-slate-500">{section.id}.md</span>
                  {editor.renderSectionActions(section)}
                </div>
              ) : null}
              {editor?.renderSectionBody?.(section) ?? <MarkdownBody source={section.body} />}
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
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Roteiro de integração</h2>
          {editor?.operationsToolbar}
        </div>

        {operations.length === 0 && isEditing ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
            Nenhuma operação cadastrada neste manual ainda.
          </p>
        ) : null}

        <ol className="space-y-4">
          {operations.map((op) => {
            const card = (
              <>
                <span className="text-xs font-medium uppercase text-brand-700">{op.kind}</span>
                <h3 className="mt-1 font-semibold">{op.title ?? `${op.kind} ${op.name}`}</h3>
                {op.description ? (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{op.description}</p>
                ) : null}
              </>
            );

            return (
              <li key={`${op.kind}-${op.name}`}>
                {isEditing ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    {card}
                    {editor?.renderOperationActions ? (
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        {editor.renderOperationActions(op)}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    href={docsOperationHref(config.slug, op.kind, op.name)}
                    className="block rounded-lg border border-slate-200 p-4 transition hover:border-brand-600"
                  >
                    {card}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </article>
  );
}
