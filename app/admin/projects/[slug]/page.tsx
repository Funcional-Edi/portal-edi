import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";
import { ConnectGatewayForm } from "@/modules/living-docs-externa/ui/admin/connect-gateway-form";
import { ConnectApiForm } from "@/modules/living-docs-externa/ui/admin/connect-api-form";
import { getCatalogProduct } from "@/modules/living-docs-externa/repository/catalog-product-repository";
import { SyncSchemaForm } from "@/modules/living-docs-externa/ui/admin/sync-schema-form";
import { OperationsList } from "@/modules/living-docs-externa/ui/admin/operations-list";
import { SuggestOperationsPanel } from "@/modules/living-docs-externa/ui/admin/suggest-operations-panel";
import { PublishToggle } from "@/modules/living-docs-externa/ui/admin/publish-toggle";
import { ProjectExportActions } from "@/modules/living-docs-externa/ui/shared/export-buttons";
import { getProject } from "@/modules/living-docs-externa/repository/project-repository";
import { getManualQualityReport } from "@/modules/living-docs-externa/services/manual-quality";
import { getSuggestedOperations } from "@/modules/living-docs-externa/services/suggest-operations-from-schema";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const [qualityReport, catalogProduct] = await Promise.all([
    getManualQualityReport(slug),
    project.config.productId ? getCatalogProduct(project.config.productId) : Promise.resolve(null),
  ]);
  const isGraphql = project.config.protocol !== "rest";
  const gatewayConnected = Boolean(
    isGraphql ? project.config.graphqlUrl : project.config.apiBaseUrl
  );
  const suggestedOperations = isGraphql
    ? await getSuggestedOperations(slug)
    : { hasSchema: false, suggestions: [] };

  return (
    <AdminShell>
      <header className="mb-8">
        <Link
          href="/admin/projects"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          ← Voltar para projetos
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{project.config.name}</h1>
        <p className="mt-2 font-mono text-sm text-slate-500">{project.config.slug}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/admin/projects/${project.config.slug}/edit`}
            className="inline-flex items-center rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
          >
            Abrir editor do manual
          </Link>
          <Link
            href={`/admin/projects/${project.config.slug}/flow`}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Editor de fluxograma
          </Link>
        </div>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Status</dt>
            <dd className="mt-1">
              <PublishToggle
                slug={project.config.slug}
                published={project.config.published}
                qualityReport={qualityReport ?? undefined}
              />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Produto</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {project.config.productId ? (
                <Link
                  href={`/docs?produto=${project.config.productId}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {catalogProduct?.name ?? project.config.productId}
                </Link>
              ) : (
                "Não vinculado"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Operações</dt>
            <dd className="mt-1 text-sm text-slate-900">{project.manual.operations.length}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Protocolo</dt>
            <dd className="mt-1 text-sm text-slate-900 uppercase">{project.config.protocol}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Gateway</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {project.config.gatewaySlug ?? "Não conectado"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              {isGraphql ? "GraphQL URL" : "URL base da API"}
            </dt>
            <dd className="mt-1 text-sm text-slate-900">
              {(isGraphql ? project.config.graphqlUrl : project.config.apiBaseUrl) ?? "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isGraphql ? "Conectar gateway" : "Conectar API"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {isGraphql
            ? "Informe a URL GraphQL do gateway e as credenciais para validar a conexão. As credenciais são cifradas e armazenadas apenas no servidor."
            : "Informe a URL base da API REST e as credenciais. As credenciais são cifradas e armazenadas apenas no servidor."}
        </p>
        <div className="mt-5">
          {isGraphql ? (
            <ConnectGatewayForm
              slug={project.config.slug}
              currentGraphqlUrl={project.config.graphqlUrl}
            />
          ) : (
            <ConnectApiForm slug={project.config.slug} currentApiBaseUrl={project.config.apiBaseUrl} />
          )}
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Exportar coleções</h2>
        <p className="mt-1 text-sm text-slate-600">
          Gera arquivos Postman ou Insomnia a partir das operações curadas no manual.
          Nenhuma credencial é incluída no export.
        </p>
        <div className="mt-5">
          <ProjectExportActions slug={project.config.slug} gatewayConnected={gatewayConnected} />
        </div>
      </div>

      {isGraphql ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Sincronizar schema</h2>
          <p className="mt-1 text-sm text-slate-600">
            Busca o snapshot de introspection no gateway conectado e salva em{" "}
            <code>data/projects/{project.config.slug}/schema.json</code>.
          </p>
          <div className="mt-5">
            <SyncSchemaForm slug={project.config.slug} disabled={!project.config.graphqlUrl} />
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Sincronizar schema</h2>
          <p className="mt-1 text-sm text-slate-600">
            Não se aplica a projetos REST — não há introspection. As operações deste manual
            são cadastradas manualmente em <strong>Operações do manual</strong>, abaixo.
          </p>
        </div>
      )}

      {isGraphql ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Sugestões a partir do schema</h2>
          <p className="mt-1 text-sm text-slate-600">
            O portal descobre as queries e mutations do schema sincronizado e monta um
            rascunho de cada uma. Marque as que fazem parte deste produto — sem IA, sem
            custo, e nada entra no manual sem você confirmar.
          </p>
          <div className="mt-5">
            <SuggestOperationsPanel slug={project.config.slug} result={suggestedOperations} />
          </div>
        </div>
      ) : null}

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Operações do manual</h2>
        <p className="mt-1 text-sm text-slate-600">
          Adicione, edite e remova as operações exibidas em{" "}
          <code>content/projects/{project.config.slug}/manual.json</code>.
        </p>
        <div className="mt-5">
          <OperationsList slug={project.config.slug} manual={project.manual} />
        </div>
      </div>
    </AdminShell>
  );
}
