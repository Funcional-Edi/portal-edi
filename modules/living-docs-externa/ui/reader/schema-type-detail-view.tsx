import Link from "next/link";

import { Badge } from "@/core/ui/badge";
import type { PublishedSchemaTypeDetail } from "@/modules/living-docs-externa/services/get-published-schema";
import { schemaTypeHref } from "@/modules/living-docs-externa/services/get-published-schema";
import type {
  SchemaArgDetail,
  SchemaFieldDetail,
  SchemaInputFieldDetail,
  SchemaTypeNameRef,
} from "@/modules/living-docs-externa/services/schema-reference";

interface SchemaTypeDetailViewProps {
  data: PublishedSchemaTypeDetail;
}

function TypeLink({
  slug,
  typeRef,
}: {
  slug: string;
  typeRef: SchemaTypeNameRef;
}) {
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

function ArgsList({ slug, args }: { slug: string; args: SchemaArgDetail[] }) {
  if (args.length === 0) return <span className="text-xs text-slate-500">—</span>;

  return (
    <ul className="space-y-1">
      {args.map((arg) => (
        <li key={arg.name} className="text-xs">
          <span className="font-mono text-slate-800">{arg.name}</span>
          {": "}
          <TypeLink slug={slug} typeRef={arg.type} />
          {arg.defaultValue ? (
            <span className="text-slate-500"> = {arg.defaultValue}</span>
          ) : null}
          {arg.description ? (
            <p className="mt-0.5 text-slate-600">{arg.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function FieldsTable({ slug, fields }: { slug: string; fields: SchemaFieldDetail[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2.5">Campo</th>
            <th className="px-4 py-2.5">Argumentos</th>
            <th className="px-4 py-2.5">Retorno</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.name} className="border-t border-slate-100 align-top">
              <td className="px-4 py-3">
                <p className="font-mono text-brand-800">{field.name}</p>
                {field.description ? (
                  <p className="mt-1 text-slate-600">{field.description}</p>
                ) : null}
                {field.isDeprecated ? (
                  <p className="mt-1 text-xs text-amber-700">
                    Deprecated
                    {field.deprecationReason ? `: ${field.deprecationReason}` : ""}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <ArgsList slug={slug} args={field.args} />
              </td>
              <td className="px-4 py-3">
                <TypeLink slug={slug} typeRef={field.returnType} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InputFieldsTable({
  slug,
  fields,
}: {
  slug: string;
  fields: SchemaInputFieldDetail[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2.5">Campo</th>
            <th className="px-4 py-2.5">Tipo</th>
            <th className="px-4 py-2.5">Default</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.name} className="border-t border-slate-100 align-top">
              <td className="px-4 py-3">
                <p className="font-mono text-brand-800">{field.name}</p>
                {field.description ? (
                  <p className="mt-1 text-slate-600">{field.description}</p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <TypeLink slug={slug} typeRef={field.type} />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                {field.defaultValue ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NamedTypeList({ slug, title, names }: { slug: string; title: string; names: string[] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {names.map((name) => (
          <li key={name}>
            <Link
              href={schemaTypeHref(slug, name)}
              className="inline-flex rounded-md border border-slate-200 bg-white px-3 py-1.5 font-mono text-sm text-brand-700 hover:border-brand-600"
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SchemaTypeDetailView({ data }: SchemaTypeDetailViewProps) {
  const { project, typeDetail } = data;
  const slug = project.config.slug;

  return (
    <article>
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/docs/api" className="hover:text-brand-700">
          Referência API
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/docs/api/${slug}`} className="hover:text-brand-700">
          {project.config.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-mono text-slate-700">{typeDetail.name}</span>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-xs font-medium uppercase text-brand-700">Tipo GraphQL</p>
        <h1 className="mt-1 font-mono text-2xl font-bold tracking-tight text-slate-900">
          {typeDetail.name}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="neutral">{typeDetail.kind}</Badge>
          {typeDetail.fields ? (
            <Badge tone="neutral">{typeDetail.fields.length} campos</Badge>
          ) : null}
          {typeDetail.enumValues ? (
            <Badge tone="neutral">{typeDetail.enumValues.length} valores</Badge>
          ) : null}
        </div>
        {typeDetail.description ? (
          <p className="mt-3 text-sm text-slate-600">{typeDetail.description}</p>
        ) : null}
        <div className="mt-4">
          <Link
            href={`/docs/api/${slug}`}
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            ← Voltar ao schema
          </Link>
        </div>
      </header>

      <div className="space-y-10">
        {typeDetail.interfaces?.length ? (
          <NamedTypeList slug={slug} title="Interfaces" names={typeDetail.interfaces} />
        ) : null}

        {typeDetail.fields?.length ? (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Campos</h2>
            <FieldsTable slug={slug} fields={typeDetail.fields} />
          </section>
        ) : null}

        {typeDetail.inputFields?.length ? (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Input fields</h2>
            <InputFieldsTable slug={slug} fields={typeDetail.inputFields} />
          </section>
        ) : null}

        {typeDetail.enumValues?.length ? (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Valores</h2>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Valor</th>
                    <th className="px-4 py-2.5">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {typeDetail.enumValues.map((value) => (
                    <tr key={value.name} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-mono text-brand-800">{value.name}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {value.description ?? "—"}
                        {value.isDeprecated ? (
                          <span className="ml-2 text-xs text-amber-700">Deprecated</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {typeDetail.possibleTypes?.length ? (
          <NamedTypeList slug={slug} title="Tipos possíveis" names={typeDetail.possibleTypes} />
        ) : null}

        {!typeDetail.fields?.length &&
        !typeDetail.inputFields?.length &&
        !typeDetail.enumValues?.length &&
        !typeDetail.possibleTypes?.length ? (
          <p className="text-sm text-slate-600">
            Este tipo não possui campos, valores ou membros adicionais no snapshot.
          </p>
        ) : null}
      </div>
    </article>
  );
}
