import type {
  ManualOperation,
  ManualReferenceTable,
} from "@/modules/living-docs-externa/schema";
import { docsPlaygroundHref } from "@/modules/living-docs-externa/services/docs-routes";
import type { OperationSchemaDetail } from "@/modules/living-docs-externa/services/schema-reference";
import { OperationSchemaFields } from "@/modules/living-docs-externa/ui/reader/operation-schema-fields";
import Link from "next/link";

interface OperationDocumentationProps {
  slug: string;
  operation: ManualOperation;
  schemaDetail?: OperationSchemaDetail | null;
  referenceTables?: ManualReferenceTable[];
  canUsePlayground?: boolean;
  idPrefix?: string;
}

export function OperationDocumentation({
  slug,
  operation,
  schemaDetail,
  referenceTables = [],
  canUsePlayground = false,
  idPrefix = "",
}: OperationDocumentationProps) {
  const isRest = operation.kind === "rest";
  const sectionId = (id: string) => idPrefix ? `${idPrefix}-${id}` : id;

  return (
    <>
      {operation.description ? (
        <section id={sectionId("descricao")} className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">Descrição</h2>
          <p className="text-slate-700">{operation.description}</p>
        </section>
      ) : null}

      {operation.authRequired !== undefined || operation.prerequisites?.length ? (
        <section id={sectionId("pre-requisitos")} className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">Pré-requisitos</h2>
          {operation.authRequired !== undefined ? (
            <p className="text-slate-700">
              Autenticação: {operation.authRequired ? "obrigatória" : "não necessária"}.
            </p>
          ) : null}
          {operation.prerequisites?.length ? (
            <p className="mt-1 text-slate-700">
              Conclua antes:{" "}
              {operation.prerequisites.map((name) => (
                <code key={name} className="mr-1 font-mono text-brand-800">{name}</code>
              ))}
            </p>
          ) : null}
        </section>
      ) : null}

      {operation.businessNotes?.length ? (
        <section id={sectionId("regras-negocio")} className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">Observação</h2>
          <ul className="list-disc space-y-1 pl-5 text-slate-700">
            {operation.businessNotes.map((note, index) => <li key={index}>{note}</li>)}
          </ul>
        </section>
      ) : null}

      {!isRest && schemaDetail ? (
        <OperationSchemaFields slug={slug} schemaDetail={schemaDetail} idPrefix={idPrefix} />
      ) : null}

      {referenceTables.length ? (
        <section id={sectionId("tabelas-referencia")} className="mb-6 scroll-mt-24">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Tabelas de referência</h2>
          <div className="space-y-3">
            {referenceTables.map((table, index) => (
              <details
                key={table.id}
                className="group rounded-lg border border-slate-200 bg-white [&_summary::-webkit-details-marker]:hidden"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                  <span className="font-medium text-slate-800">{table.title}</span>
                  <span className="text-xs text-slate-500">
                    {table.rows.length} {table.rows.length === 1 ? "linha" : "linhas"}
                  </span>
                </summary>
                <div className="overflow-x-auto border-t border-slate-100">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {table.columns.map((column) => (
                          <th key={column} className="px-3 py-2 text-left font-medium text-slate-700">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-slate-100">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 text-slate-600">{cell}</td>
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

      {isRest ? (
        <section id={sectionId("endpoint-rest")} className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">Endpoint</h2>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
            <code>{operation.method} {operation.path}</code>
          </pre>
          {operation.exampleBody ? (
            <>
              <h3 className="mb-2 mt-4 text-sm font-semibold uppercase text-slate-500">Corpo de exemplo</h3>
              <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
                <code>{operation.exampleBody}</code>
              </pre>
            </>
          ) : null}
          <p className="mt-3 text-sm text-slate-600">
            Esta API é <span className="font-medium">REST</span> — o Teste de Requisição não está disponível para este protocolo.
            Use um cliente HTTP (Insomnia, Postman, curl) enviando o token JWT no header{" "}
            <code>Authorization: Bearer &lt;token&gt;</code>.
          </p>
        </section>
      ) : operation.exampleQuery ? (
        <section id={sectionId("exemplo-graphql")} className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">Exemplo GraphQL</h2>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
            <code>{operation.exampleQuery}</code>
          </pre>
          {canUsePlayground ? (
            <Link
              href={docsPlaygroundHref(slug, operation.exampleQuery)}
              className="mt-3 inline-flex items-center rounded-md border border-brand-700 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              Teste de Requisição
            </Link>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              O Teste de Requisição executa contra o gateway real e está disponível apenas para perfil{" "}
              <span className="font-medium">admin</span>. Copie o exemplo acima ou peça acesso ao time de integração.
            </p>
          )}
        </section>
      ) : null}
    </>
  );
}
