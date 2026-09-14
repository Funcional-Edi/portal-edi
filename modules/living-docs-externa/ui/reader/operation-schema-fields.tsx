import Link from "next/link";

import { Badge } from "@/core/ui/badge";
import type {
  OperationSchemaDetail,
  SchemaFieldRow,
  SchemaInputTypeSection,
  SchemaTypeNameRef,
} from "@/modules/living-docs-externa/services/schema-reference";
import { schemaTypeHref } from "@/modules/living-docs-externa/services/get-published-schema";

interface OperationSchemaFieldsProps {
  slug: string;
  schemaDetail: OperationSchemaDetail;
}

function TypeCell({ slug, typeRef }: { slug: string; typeRef: SchemaTypeNameRef }) {
  const { namedType, formatted } = typeRef;
  if (!namedType || namedType.startsWith("__")) {
    return <span className="font-mono text-brand-800">{formatted}</span>;
  }
  return (
    <Link
      href={schemaTypeHref(slug, namedType)}
      className="font-mono text-brand-700 hover:underline"
    >
      {formatted}
    </Link>
  );
}

function SchemaFieldsTable({
  slug,
  rows,
}: {
  slug: string;
  rows: SchemaFieldRow[];
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-600">Nenhum campo documentado neste bloco.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
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
              <td className="px-4 py-3 font-mono text-brand-800">{row.name}</td>
              <td className="px-4 py-3">
                <TypeCell slug={slug} typeRef={row.type} />
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
}: {
  slug: string;
  section: SchemaInputTypeSection;
}) {
  return (
    <div className="mt-4">
      <h3 className="mb-2 font-medium text-slate-900">
        Tipo <span className="font-mono text-brand-700">{section.typeName}</span>
      </h3>
      {section.description ? (
        <p className="mb-3 text-sm text-slate-600">{section.description}</p>
      ) : null}
      <SchemaFieldsTable slug={slug} rows={section.fields} />
    </div>
  );
}

export function OperationSchemaFields({ slug, schemaDetail }: OperationSchemaFieldsProps) {
  const hasRequest =
    schemaDetail.requestArgs.length > 0 || schemaDetail.requestInputTypes.length > 0;
  const hasResponse = schemaDetail.responseFields.length > 0;

  if (!hasRequest && !hasResponse) return null;

  return (
    <>
      {hasRequest ? (
        <section id="campos-requisicao" className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            Campos da requisição
          </h2>
          {schemaDetail.requestArgs.length > 0 ? (
            <SchemaFieldsTable slug={slug} rows={schemaDetail.requestArgs} />
          ) : null}
          {schemaDetail.requestInputTypes.map((section) => (
            <InputTypeSection key={section.typeName} slug={slug} section={section} />
          ))}
        </section>
      ) : null}

      {hasResponse ? (
        <section id="campos-resposta" className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            Campos da resposta
            {schemaDetail.responseTypeName ? (
              <>
                {" "}
                (
                <Link
                  href={schemaTypeHref(slug, schemaDetail.responseTypeName)}
                  className="font-mono normal-case text-brand-700 hover:underline"
                >
                  {schemaDetail.responseTypeName}
                </Link>
                )
              </>
            ) : null}
          </h2>
          <SchemaFieldsTable slug={slug} rows={schemaDetail.responseFields} />
        </section>
      ) : null}
    </>
  );
}
