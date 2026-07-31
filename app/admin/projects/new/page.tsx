import Link from "next/link";

import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";
import { CreateProjectForm } from "@/modules/living-docs-externa/ui/admin/create-project-form";

export default function NewProjectPage() {
  return (
    <AdminShell>
      <header className="mb-8">
        <Link
          href="/admin/projects"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          ← Voltar para projetos
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Novo projeto</h1>
        <p className="mt-2 text-slate-600">
          Cria a pasta do manual em <code className="text-xs">content/projects/&lt;slug&gt;/</code>{" "}
          com <code className="text-xs">config.json</code> e <code className="text-xs">manual.json</code>{" "}
          iniciais.
        </p>
      </header>
      <CreateProjectForm />
    </AdminShell>
  );
}
