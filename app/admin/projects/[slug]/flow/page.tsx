import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";
import { getProject } from "@/modules/living-docs-externa/repository/project-repository";
import {
  getIntegrationFlow,
  getManualRef,
} from "@/modules/fluxogramas/repository/flow-repository";
import { createEmptyFlow } from "@/modules/fluxogramas/services/save-flow";
import { FlowEditor } from "@/modules/fluxogramas/ui/flow-editor";

interface AdminFlowPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminFlowPage({ params }: AdminFlowPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const [existingFlow, manual] = await Promise.all([
    getIntegrationFlow(slug),
    getManualRef(slug),
  ]);

  const initialFlow =
    existingFlow ??
    createEmptyFlow(`Fluxo — ${project.config.name}`);

  return (
    <AdminShell>
      <header className="mb-8">
        <Link
          href={`/admin/projects/${slug}`}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          ← Voltar para {project.config.name}
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Editor de fluxograma</h1>
        <p className="mt-2 text-sm text-slate-600">
          Curadoria do fluxo de integração vinculado ao manual{" "}
          <code>content/projects/{slug}/flow.json</code>.
        </p>
        <Link
          href={`/fluxogramas/${slug}`}
          className="mt-4 inline-flex text-sm font-medium text-brand-700 hover:underline"
        >
          Ver como distribuidor →
        </Link>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <FlowEditor slug={slug} initialFlow={initialFlow} manual={manual} />
      </div>
    </AdminShell>
  );
}
