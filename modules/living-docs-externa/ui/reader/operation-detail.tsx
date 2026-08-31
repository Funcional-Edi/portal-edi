import type { ManualOperation } from "@/modules/living-docs-externa/schema";
import { buildPlaygroundHref } from "@/modules/living-docs-externa/services/playground-access";
import {
  DOCS_HOME_HREF,
  docsGuideHref,
} from "@/modules/living-docs-externa/services/docs-routes";
import { ExportDownloadButton } from "@/modules/living-docs-externa/ui/shared/export-buttons";
import Link from "next/link";

interface OperationDetailProps {
  slug: string;
  manualTitle: string;
  operation: ManualOperation;
  /** `true` quando o projeto tem gateway GraphQL ou API REST conectada. */
  gatewayConnected?: boolean;
  schemaFieldHref?: string;
  /** Playground executa contra gateway real — só perfil admin, e só faz sentido em GraphQL. */
  canUsePlayground?: boolean;
}

export function OperationDetail({
  slug,
  manualTitle,
  operation,
  gatewayConnected = false,
  schemaFieldHref,
  canUsePlayground = false,
}: OperationDetailProps) {
  const isRest = operation.kind === "rest";

  return (
    <article>
      <nav className="mb-6 text-sm text-slate-500">
        <Link href={DOCS_HOME_HREF} className="hover:text-brand-700">
          Documentação
        </Link>
        <span className="mx-2">/</span>
        <Link href={docsGuideHref(slug)} className="hover:text-brand-700">
          {manualTitle}
        </Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-6">
        <span className="text-xs font-medium uppercase text-brand-700">
          {isRest ? operation.method ?? "rest" : operation.kind}
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {operation.title ?? operation.name}
        </h1>
        <p className="mt-1 font-mono text-sm text-slate-500">{operation.name}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ExportDownloadButton
            slug={slug}
            format="postman"
            label="Exportar manual (Postman)"
            disabled={!gatewayConnected}
          />
          {schemaFieldHref ? (
            <Link
              href={schemaFieldHref}
              className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Ver na referência GraphQL
            </Link>
          ) : null}
        </div>
      </header>

      {operation.description ? (
        <section id="descricao" className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            Descrição
          </h2>
          <p className="text-slate-700">{operation.description}</p>
        </section>
      ) : null}

      {operation.businessNotes && operation.businessNotes.length > 0 ? (
        <section id="regras-negocio" className="mb-6 scroll-mt-24">
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

      {isRest ? (
        <section id="endpoint-rest" className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">Endpoint</h2>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
            <code>
              {operation.method} {operation.path}
            </code>
          </pre>
          {operation.exampleBody ? (
            <>
              <h3 className="mt-4 mb-2 text-sm font-semibold uppercase text-slate-500">
                Corpo de exemplo
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
                <code>{operation.exampleBody}</code>
              </pre>
            </>
          ) : null}
          <p className="mt-3 text-sm text-slate-600">
            Esta API é <span className="font-medium">REST</span> — não há playground no portal.
            Use um cliente HTTP (Insomnia, Postman, curl) enviando o token JWT no header{" "}
            <code>Authorization: Bearer &lt;token&gt;</code>.
          </p>
        </section>
      ) : operation.exampleQuery ? (
        <section id="exemplo-graphql" className="mb-6 scroll-mt-24">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            Exemplo GraphQL
          </h2>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
            <code>{operation.exampleQuery}</code>
          </pre>
          {canUsePlayground ? (
            <Link
              href={buildPlaygroundHref(slug, operation.exampleQuery)}
              className="mt-3 inline-flex items-center rounded-md border border-brand-700 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              Testar no playground
            </Link>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              O playground executa contra o gateway real e está disponível apenas para perfil{" "}
              <span className="font-medium">admin</span>. Copie o exemplo acima ou peça acesso ao
              time de integração.
            </p>
          )}
        </section>
      ) : null}

      <footer className="mt-8">
        <Link
          href={docsGuideHref(slug)}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          ← Voltar ao roteiro
        </Link>
      </footer>
    </article>
  );
}
