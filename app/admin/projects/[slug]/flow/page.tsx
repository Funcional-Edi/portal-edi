import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";
import { getProject } from "@/modules/living-docs-externa/repository/project-repository";
import {
  getIntegrationFlows,
  getManualRef,
} from "@/modules/fluxogramas/repository/flow-repository";
import { createEmptyFlow } from "@/modules/fluxogramas/services/save-flow";
import { FlowEditor } from "@/modules/fluxogramas/ui/flow-editor";

interface AdminFlowPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fluxo?: string }>;
}

export default async function AdminFlowPage({ params, searchParams }: AdminFlowPageProps) {
  const { slug } = await params;
  const { fluxo: requestedFlowId } = await searchParams;
  const project = await getProject(slug);
  if (!project) notFound();

  const [existingFlows, manual] = await Promise.all([
    getIntegrationFlows(slug),
    getManualRef(slug),
  ]);

  const selectedFlowId = existingFlows.some((flow) => flow.id === requestedFlowId)
    ? requestedFlowId!
    : existingFlows[0]?.id ?? "default";
  const existingFlow = existingFlows.find((flow) => flow.id === selectedFlowId);
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

      {existingFlows.length > 1 ? (
        <nav aria-label="Fluxos do produto" className="mb-6 flex flex-wrap gap-2">
          {existingFlows.map((flow) => (
            <Link
              key={flow.id}
              href={`/admin/projects/${slug}/flow?fluxo=${encodeURIComponent(flow.id)}`}
              className={`rounded-md border px-3 py-2 text-sm ${flow.id === selectedFlowId
                ? "border-brand-600 bg-brand-50 font-semibold text-brand-800"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              {flow.title}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <FlowEditor slug={slug} flowId={selectedFlowId} initialFlow={initialFlow} manual={manual} />
      </div>
    </AdminShell>
  );
}
