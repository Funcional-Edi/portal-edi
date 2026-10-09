import Link from "next/link";

import { Badge } from "@/core/ui/badge";
import type {
  OperationSchemaDetail,
  SchemaFieldRow,
  SchemaInputTypeSection,
  SchemaTypeNameRef,
} from "@/modules/living-docs-externa/services/schema-reference";
import { schemaTypeHref } from "@/modules/living-docs-externa/services/docs-routes";

interface OperationSchemaFieldsProps {
  slug: string;
  schemaDetail: OperationSchemaDetail;
  idPrefix?: string;
  returnTo?: string;
}

function TypeCell({ slug, typeRef, returnTo }: { slug: string; typeRef: SchemaTypeNameRef; returnTo?: string }) {
  const { namedType, formatted } = typeRef;
  if (!namedType || namedType.startsWith("__")) {
    return <span className="break-words font-mono text-brand-800">{formatted}</span>;
  }
  return (
    <Link
      href={schemaTypeHref(slug, namedType, returnTo)}
      className="break-words font-mono text-brand-700 hover:underline"
    >
      {formatted}
    </Link>
  );
}

function SchemaFieldsTable({
  slug,
  rows,
  returnTo,
}: {
  slug: string;
  rows: SchemaFieldRow[];
  returnTo?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-600">Nenhum campo documentado neste bloco.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[64rem] table-fixed text-sm">
        <colgroup>
          <col className="w-[22%]" />
          <col className="w-[26%]" />
          <col className="w-[12%]" />
          <col className="w-[40%]" />
        </colgroup>
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2.5">Campo</th>
            <th className="px-4 py-2.5">Tipo</th>
            <th className="px-4 py-2.5">Obrigatório</th>
            <th className="px-4 py-2.5">Descrição</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-slate-100 align-top">
              <td className="break-words px-4 py-3 font-mono text-brand-800">{row.name}</td>
              <td className="px-4 py-3">
                <TypeCell slug={slug} typeRef={row.type} returnTo={returnTo} />
              </td>
              <td className="px-4 py-3">
                {row.required ? (
                  <Badge tone="warning">Sim</Badge>
                ) : (
                  <span className="text-slate-500">Não</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {row.description ?? "—"}
                {row.defaultValue ? (
                  <p className="mt-1 text-xs text-slate-500">Padrão: {row.defaultValue}</p>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InputTypeSection({
  slug,
  section,
  returnTo,
}: {
  slug: string;
  section: SchemaInputTypeSection;
  returnTo?: string;
}) {
  return (
    <div className="mt-4">
      <h3 className="mb-2 font-medium text-slate-900">
        Tipo <span className="font-mono text-brand-700">{section.typeName}</span>
      </h3>
      {section.description ? (
        <p className="mb-3 text-sm text-slate-600">{section.description}</p>
      ) : null}
      <SchemaFieldsTable slug={slug} rows={section.fields} returnTo={returnTo} />
    </div>
  );
}

export function OperationSchemaFields({ slug, schemaDetail, idPrefix = "", returnTo }: OperationSchemaFieldsProps) {
  const hasRequest =
    schemaDetail.requestArgs.length > 0 || schemaDetail.requestInputTypes.length > 0;
  const hasResponse = schemaDetail.responseFields.length > 0;
  const sectionId = (id: string) => idPrefix ? `${idPrefix}-${id}` : id;

  if (!hasRequest && !hasResponse) return null;

  return (
    <>
      {hasRequest ? (
        <section id={sectionId("campos-requisicao")} className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            Campos da requisição
          </h2>
          {schemaDetail.requestArgs.length > 0 ? (
            <SchemaFieldsTable slug={slug} rows={schemaDetail.requestArgs} returnTo={returnTo} />
          ) : null}
          {schemaDetail.requestInputTypes.map((section) => (
            <InputTypeSection key={section.typeName} slug={slug} section={section} returnTo={returnTo} />
          ))}
        </section>
      ) : null}

      {hasResponse ? (
        <section id={sectionId("campos-resposta")} className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            Campos da resposta
            {schemaDetail.responseTypeName ? (
              <>
                {" "}
                (
                <Link
                  href={schemaTypeHref(slug, schemaDetail.responseTypeName, returnTo)}
                  className="font-mono normal-case text-brand-700 hover:underline"
                >
                  {schemaDetail.responseTypeName}
                </Link>
                )
              </>
            ) : null}
          </h2>
          <SchemaFieldsTable slug={slug} rows={schemaDetail.responseFields} returnTo={returnTo} />
        </section>
      ) : null}
    </>
  );
}
