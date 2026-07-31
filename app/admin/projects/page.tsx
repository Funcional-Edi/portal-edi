import Link from "next/link";

import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";
import { ProjectList } from "@/modules/living-docs-externa/ui/admin/project-list";
import { listProjects } from "@/modules/living-docs-externa/services/list-projects";

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <AdminShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="mt-2 text-slate-600">
            Gerencie manuais de integração GraphQL curados por produto.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
        >
          Novo projeto
        </Link>
      </header>
      <ProjectList projects={projects} />
    </AdminShell>
  );
}
