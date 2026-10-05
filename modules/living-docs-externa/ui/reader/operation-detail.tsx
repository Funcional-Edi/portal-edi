import type {
  ManualOperation,
  ManualReferenceTable,
} from "@/modules/living-docs-externa/schema";
import { DOCS_HOME_HREF, docsGuideHref } from "@/modules/living-docs-externa/services/docs-routes";
import type { OperationSchemaDetail } from "@/modules/living-docs-externa/services/schema-reference";
import { OperationDocumentation } from "@/modules/living-docs-externa/ui/reader/operation-documentation";
import { ExportDownloadButton } from "@/modules/living-docs-externa/ui/shared/export-buttons";
import Link from "next/link";

interface OperationDetailProps {
  slug: string;
  manualTitle: string;
  operation: ManualOperation;
  /** `true` quando o projeto tem gateway GraphQL ou API REST conectada. */
  gatewayConnected?: boolean;
  schemaFieldHref?: string;
  /** Campos de requisição/resposta extraídos do schema GraphQL (equivalente ao PDF). */
  schemaDetail?: OperationSchemaDetail | null;
  /** Tabelas usadas diretamente pelos campos desta operação. */
  referenceTables?: ManualReferenceTable[];
  /** Playground executa contra gateway real — só perfil admin, e só faz sentido em GraphQL. */
  canUsePlayground?: boolean;
}

export function OperationDetail({
  slug,
  manualTitle,
  operation,
  gatewayConnected = false,
  schemaFieldHref,
  schemaDetail,
  referenceTables = [],
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

      <OperationDocumentation
        slug={slug}
        operation={operation}
        schemaDetail={schemaDetail}
        referenceTables={referenceTables}
        canUsePlayground={canUsePlayground}
      />

      {!isRest ? (
        <section className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-4">
          <h2 className="text-sm font-semibold text-brand-900">
            Consulte a Jornada da Integração
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-brand-800">
            Queries e mutations precisam ser analisadas dentro do processo completo de uso.
            Consulte a Jornada para conferir pré-requisitos, ordem das etapas e decisões de continuidade do subproduto.
          </p>
          <Link
            href={`${docsGuideHref(slug)}#jornada-integracao`}
            className="mt-3 inline-flex text-sm font-medium text-brand-800 underline hover:text-brand-950"
          >
            Ver a Jornada da Integração
          </Link>
        </section>
      ) : null}

    </article>
  );
}
