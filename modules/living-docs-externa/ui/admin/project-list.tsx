import type { ProjectSummary } from "@/modules/living-docs-externa/schema";
import type { CatalogProduct } from "@/modules/living-docs-externa/schema/catalog-product";
import Link from "next/link";

import { Badge } from "@/core/ui/badge";

interface ProjectListProps {
  projects: ProjectSummary[];
  products: CatalogProduct[];
}

function statusLabel(project: ProjectSummary): string {
  if (project.published) return "Publicado";
  if (project.manualStatus === "needs-review") return "Revisão";
  return "Rascunho";
}

function statusClass(project: ProjectSummary): string {
  if (project.published) return "bg-green-50 text-green-800";
  if (project.manualStatus === "needs-review") return "bg-amber-50 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

export function ProjectList({ projects, products }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
        Nenhum projeto cadastrado.{" "}
        <Link href="/admin/projects/new" className="font-medium text-brand-700 hover:underline">
          Criar o primeiro
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Projeto</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Slug</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Produto</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Ambiente</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {projects.map((project) => (
            <tr key={project.slug} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{project.name}</p>
                {project.description ? (
                  <p className="mt-0.5 text-xs text-slate-500">{project.description}</p>
                ) : null}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{project.slug}</td>
              <td className="px-4 py-3">
                {project.productId ? (
                  <Badge tone="brand">
                    {products.find((product) => product.id === project.productId)?.name ?? project.productId}
                  </Badge>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(project)}`}
                >
                  {statusLabel(project)}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{project.environment ?? "—"}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/projects/${project.slug}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  Abrir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
