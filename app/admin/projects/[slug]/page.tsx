import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";
import { ConnectGatewayForm } from "@/modules/living-docs-externa/ui/admin/connect-gateway-form";
import { getProject } from "@/modules/living-docs-externa/repository/project-repository";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

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
      </header>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {project.config.published ? "Publicado" : "Rascunho"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Operações</dt>
            <dd className="mt-1 text-sm text-slate-900">{project.manual.operations.length}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Gateway</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {project.config.gatewaySlug ?? "Não conectado"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">GraphQL URL</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {project.config.graphqlUrl ?? "—"}
            </dd>
          </div>
        </dl>

        <p className="mt-6 text-sm text-slate-600">
          Próximas etapas da Fase 3: sync schema e editor de operações.
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Conectar gateway</h2>
        <p className="mt-1 text-sm text-slate-600">
          Informe a URL GraphQL do gateway e as credenciais para validar a conexão. As
          credenciais são cifradas e armazenadas apenas no servidor.
        </p>
        <div className="mt-5">
          <ConnectGatewayForm slug={project.config.slug} currentGraphqlUrl={project.config.graphqlUrl} />
        </div>
      </div>
    </AdminShell>
  );
}
