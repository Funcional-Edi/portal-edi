import type { ManualOperation, ManualSection, Project } from "@/modules/living-docs-externa/schema";
import { sortOperations } from "@/modules/living-docs-externa/schema";
import { buildPlaygroundHref } from "@/modules/living-docs-externa/services/playground-access";
import { docsOperationHref } from "@/modules/living-docs-externa/services/docs-routes";
import { MarkdownBody } from "@/modules/living-docs-externa/ui/reader/markdown-body";
import { ProjectExportActions } from "@/modules/living-docs-externa/ui/shared/export-buttons";
import { Badge, environmentBadgeTone } from "@/core/ui/badge";
import { ArrowRight, PencilLine, Search, Send } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Ícone por tipo de operação — ajuda a escanear o roteiro visualmente. */
function OperationKindIcon({ kind }: { kind: ManualOperation["kind"] }) {
  if (kind === "query") return <Search className="h-4 w-4" aria-hidden="true" />;
  if (kind === "rest") return <Send className="h-4 w-4" aria-hidden="true" />;
  return <PencilLine className="h-4 w-4" aria-hidden="true" />;
}

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
  const isGraphql = config.protocol !== "rest";
  const gatewayConnected = Boolean(isGraphql ? config.graphqlUrl : config.apiBaseUrl);

  return (
    <article>
      {editor?.banner ? <div className="mb-6">{editor.banner}</div> : null}

      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-brand-700">Manual de integraçãooo</p>
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

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {config.environment ? (
            <Badge tone={environmentBadgeTone(config.environment)}>{config.environment}</Badge>
          ) : null}
          <Badge tone="brand">{isGraphql ? "GraphQL" : "REST"}</Badge>
          <Badge tone="neutral">
            {operations.length} {operations.length === 1 ? "operação" : "operações"}
          </Badge>
          {manual.referenceTables && manual.referenceTables.length > 0 ? (
            <Badge tone="neutral">
              {manual.referenceTables.length}{" "}
              {manual.referenceTables.length === 1 ? "tabela de referência" : "tabelas de referência"}
            </Badge>
          ) : null}
          <span className="text-xs text-slate-500">
            Atualizado {formatUpdatedAt(config.updatedAt)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {editor?.headerActions ?? (
            <>
              {isGraphql && canUsePlayground ? (
                <Link
                  href={buildPlaygroundHref(config.slug)}
                  className="inline-flex items-center rounded-md border border-brand-700 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  Teste de Requisição
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
              <ProjectExportActions slug={config.slug} gatewayConnected={gatewayConnected} />
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
          <div className="space-y-3">
            {manual.referenceTables.map((table, index) => (
              <details
                key={table.id}
                className="group rounded-lg border border-slate-200 bg-white [&_summary::-webkit-details-marker]:hidden"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3">
                  <span className="font-medium text-slate-800">{table.title}</span>
                  <span className="flex items-center gap-2">
                    <Badge tone="neutral">
                      {table.rows.length} {table.rows.length === 1 ? "linha" : "linhas"}
                    </Badge>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-90"
                      aria-hidden="true"
                    />
                  </span>
                </summary>
                <div className="overflow-x-auto border-t border-slate-100">
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
              </details>
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

        <ol className="space-y-3">
          {operations.map((op, index) => {
            const card = (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase text-brand-700">
                    <OperationKindIcon kind={op.kind} />
                    {op.kind === "rest" ? op.method ?? "rest" : op.kind}
                  </span>
                  <h3 className="mt-1 font-semibold text-slate-900">
                    {op.title ?? `${op.kind} ${op.name}`}
                  </h3>
                  {op.description ? (
                    <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">{op.description}</p>
                  ) : null}
                </div>
              </>
            );

            return (
              <li key={`${op.kind}-${op.name}`}>
                {isEditing ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex gap-3">{card}</div>
                    {editor?.renderOperationActions ? (
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        {editor.renderOperationActions(op)}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    href={docsOperationHref(config.slug, op.kind, op.name)}
                    className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-600 hover:shadow-md"
                  >
                    {card}
                    <ArrowRight
                      className="mt-2 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
                      aria-hidden="true"
                    />
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
