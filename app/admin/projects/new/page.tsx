import Link from "next/link";

import { listCatalogProducts } from "@/modules/living-docs-externa/repository/catalog-product-repository";
import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";
import { CreateProjectForm } from "@/modules/living-docs-externa/ui/admin/create-project-form";

export default async function NewProjectPage() {
  const products = await listCatalogProducts();
  return (
    <AdminShell>
      <header className="mb-8">
        <Link
          href="/admin/projects"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          ← Voltar para projetos
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Novo subproduto</h1>
        <p className="mt-2 text-slate-600">
          Escolha o produto, dê o nome do subproduto e informe a API. O portal grava essa
          integração dentro do produto, valida o acesso e traz as requisições para marcar.
        </p>
      </header>
      <CreateProjectForm products={products.map((product) => ({ id: product.id, name: product.name }))} />
    </AdminShell>
  );
}
