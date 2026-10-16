import type {
  ManualOperation,
  ManualReferenceTable,
} from "@/modules/living-docs-externa/schema";
import { ImportanceNotice, type ImportanceTone } from "@/core/ui/importance-notice";
import { CopyableCode } from "@/core/ui/copyable-code";
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
  importanceNotices?: boolean;
  returnTo?: string;
}

function importanceNote(note: string): { tone: ImportanceTone; label: string; body: string } | null {
  const match = note.match(/^\[(ATENÇÃO MÁXIMA|ATENÇÃO|OBSERVAÇÃO|COMENTÁRIO)\]\s*(.*)$/i);
  if (!match) return null;
  const key = match?.[1]?.toLocaleUpperCase("pt-BR");
  const tone: ImportanceTone = key === "ATENÇÃO MÁXIMA"
    ? "critical"
    : key === "ATENÇÃO"
      ? "attention"
      : key === "COMENTÁRIO"
        ? "comment"
        : "observation";
  const label = tone === "critical"
    ? "Atenção máxima"
    : tone === "attention"
      ? "Atenção"
      : tone === "comment"
        ? "Comentário"
        : "Observação";
  return { tone, label, body: match?.[2] ?? note };
}

function graphqlVariableName(parameter: string): string {
  const normalized = parameter.startsWith("filter.") ? parameter.slice("filter.".length) : parameter;
  const parts = normalized.split(".");
  return "$" + parts.map((part, index) => {
    const camel = part.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
    return index === 0 ? camel : camel.charAt(0).toUpperCase() + camel.slice(1);
  }).join("");
}

function formatGraphqlExample(source: string): string {
  const tokens = source.match(/\$\w+|"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?|[A-Za-z_]\w*|[!():{},\[\]]/g) || [];
  const lines: string[] = [];
  let current = "";
  let indent = 0;
  let last = "";
  let braceDepth = 0;
  let parenthesisDepth = 0;
  const flush = () => {
    if (current.trim()) lines.push("  ".repeat(Math.max(0, indent)) + current.trim());
    current = "";
  };
  const append = (value: string, withSpace = true) => {
    current += current && withSpace ? " " + value : value;
  };

  for (const token of tokens) {
    if (token === "{") {
      append("{");
      flush();
      indent += 1;
      braceDepth += 1;
      last = token;
    } else if (token === "}") {
      flush();
      indent -= 1;
      append("}");
      braceDepth -= 1;
      last = token;
    } else if (token === "(") {
      append("(");
      flush();
      indent += 1;
      parenthesisDepth += 1;
      last = token;
    } else if (token === ")") {
      flush();
      indent -= 1;
      append(")");
      parenthesisDepth -= 1;
      last = token;
    } else if (token === "[") {
      append("[", false);
      last = token;
    } else if (token === "]") {
      append("]", false);
      last = token;
    } else if (token === ":") {
      append(":", false);
      current += " ";
      last = token;
    } else if (token === ",") {
      append(",", false);
      flush();
      last = token;
    } else if (token === "!") {
      append("!", false);
      last = token;
    } else {
      const inSelection = braceDepth > 0 && parenthesisDepth === 0;
      if (inSelection && current && (last === "}" || last === ")" || last === "]" || /^[A-Za-z_$]/.test(last))) {
        flush();
      }
      append(token, !["(", "[", ":", ","].includes(last));
      last = token;
    }
  }
  flush();
  return lines.join("\n");
}

function inferredExampleVariables(source: string): string | undefined {
  const declaration = source.match(/(?:query|mutation)\s+\w+\s*\(([\s\S]*?)\)\s*\{/i)?.[1];
  if (!declaration) return undefined;

  const variables: Record<string, unknown> = {};
  for (const match of declaration.matchAll(/\$(\w+)\s*:\s*(\[?)([A-Za-z_]\w*)/g)) {
    const [, name, listMarker, type] = match;
    variables[name] = listMarker
      ? []
      : type === "Boolean"
        ? false
        : type === "Int" || type === "Float"
          ? 0
          : type === "String" || type === "ID" || type === "Date" || type === "Datetime"
            ? "<PREENCHER>"
            : null;
  }
  return JSON.stringify(variables, null, 2);
}

export function OperationDocumentation({
  slug,
  operation,
  schemaDetail,
  referenceTables = [],
  canUsePlayground = false,
  idPrefix = "",
  importanceNotices = false,
  returnTo,
}: OperationDocumentationProps) {
  const isRest = operation.kind === "rest";
  const isPrescriptionMultipartUpload =
    slug === "credenciado-venda" && operation.name === "Prescription_uploadPrescription";
  const exampleQuery = operation.exampleQuery ? formatGraphqlExample(operation.exampleQuery) : undefined;
  const exampleVariables = operation.exampleVariables ?? (operation.exampleQuery ? inferredExampleVariables(operation.exampleQuery) : undefined);
  const hasExampleVariables = Boolean(exampleVariables);
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
            importanceNotices ? (
              <div className="mt-2">
                <p className="text-slate-700">Antes de continuar, confira:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
                  {operation.prerequisites.map((prerequisite) => (
                    <li key={prerequisite}>{prerequisite}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-1 text-slate-700">
                Conclua antes:{" "}
                {operation.prerequisites.map((name) => (
                  <code key={name} className="mr-1 font-mono text-brand-800">{name}</code>
                ))}
              </p>
            )
          ) : null}
        </section>
      ) : null}

      {operation.businessNotes?.length ? (
        <section id={sectionId("regras-negocio")} className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            {importanceNotices ? "Notas e alertas" : "Observação"}
          </h2>
          {importanceNotices ? (
            <ul className="space-y-2">
              {operation.businessNotes.map((note, index) => {
                const item = importanceNote(note);
                return (
                  <li key={index}>
                    {item ? (
                      <ImportanceNotice tone={item.tone}>
                        <strong>{item.label}:</strong> {item.body}
                      </ImportanceNotice>
                    ) : (
                      <p className="text-slate-700">{note}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-slate-700">
              {operation.businessNotes.map((note, index) => <li key={index}>{note}</li>)}
            </ul>
          )}
        </section>
      ) : null}

      {!isRest && schemaDetail ? (
        <OperationSchemaFields slug={slug} schemaDetail={schemaDetail} idPrefix={idPrefix} returnTo={returnTo} />
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
                        {(table.id.startsWith("params-")
                          ? [table.columns[0] ?? "Parâmetro", "Variável GraphQL", ...table.columns.slice(1)]
                          : table.columns
                        ).map((column) => (
                          <th key={column} className="px-3 py-2 text-left font-medium text-slate-700">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-slate-100">
                          {(table.id.startsWith("params-")
                            ? [row[0], graphqlVariableName(row[0]), ...row.slice(1)]
                            : row
                          ).map((cell, cellIndex) => (
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
          <CopyableCode
            code={`${operation.method} ${operation.path}`}
            className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"
          />
          {operation.exampleBody ? (
            <>
              <h3 className="mb-2 mt-4 text-sm font-semibold uppercase text-slate-500">Corpo de exemplo</h3>
              <CopyableCode
                code={operation.exampleBody}
                className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"
              />
            </>
          ) : null}
          <p className="mt-3 text-sm text-slate-600">
            Esta API é <span className="font-medium">REST</span> — o Teste de Requisição não está disponível para este protocolo.
            Use um cliente HTTP (Insomnia, Postman, curl) enviando o token JWT no header{" "}
            <code>Authorization: Bearer &lt;token&gt;</code>.
          </p>
        </section>
      ) : operation.exampleQuery ? (
        <section
          id={sectionId(isPrescriptionMultipartUpload ? "estrutura-multipart" : "exemplo-graphql")}
          className="mb-6 scroll-mt-24"
        >
          <div className="mb-2 flex items-center gap-2">
            <h2 className={`text-sm font-semibold uppercase ${hasExampleVariables ? "text-brand-700" : "text-slate-500"}`}>
              {isPrescriptionMultipartUpload
                ? "Estrutura multipart/form-data"
                : hasExampleVariables ? "Requisição GraphQL" : "Exemplo GraphQL"}
            </h2>
            {hasExampleVariables ? (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold uppercase text-brand-700">
                Envio
              </span>
            ) : null}
          </div>
          <CopyableCode
            code={exampleQuery ?? operation.exampleQuery}
            className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"
          />
          {exampleVariables ? (
            <>
              <h3 className="mb-2 mt-4 text-sm font-semibold uppercase text-slate-500">
                Variáveis da requisição (JSON)
              </h3>
              <CopyableCode
                code={exampleVariables}
                className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"
              />
            </>
          ) : null}
          {isPrescriptionMultipartUpload ? (
            <p className="mt-3 text-sm text-slate-600">
              Este envio contém um arquivo e deve ser montado como multipart/form-data; não o execute no Playground GraphQL.
            </p>
          ) : canUsePlayground ? (
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

      {operation.exampleResponse ? (
        <section id={sectionId("exemplo-resposta")} className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            Exemplo de resposta (JSON)
          </h2>
          <CopyableCode
            code={operation.exampleResponse}
            className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"
          />
        </section>
      ) : null}
    </>
  );
}
