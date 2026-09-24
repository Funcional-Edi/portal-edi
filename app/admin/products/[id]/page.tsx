import Link from "next/link";
import { notFound } from "next/navigation";

import { getCatalogProduct } from "@/modules/living-docs-externa/repository/catalog-product-repository";
import { listProjects } from "@/modules/living-docs-externa/services/list-projects";
import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";
import { CatalogProductForm } from "@/modules/living-docs-externa/ui/admin/catalog-product-form";

interface EditCatalogProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCatalogProductPage({ params }: EditCatalogProductPageProps) {
  const { id } = await params;
  const [product, projects] = await Promise.all([getCatalogProduct(id), listProjects()]);
  if (!product) notFound();

  return (
    <AdminShell activeNavHref="/admin/products">
      <header className="mb-8">
        <Link href="/admin/products" className="text-sm font-medium text-brand-700 hover:underline">
          ← Voltar para produtos
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{product.name}</h1>
        <p className="mt-2 text-slate-600">
          Alterar o nome ou as integrações atualiza o menu em /docs. O identificador permanece.
        </p>
      </header>
      <CatalogProductForm
        mode="edit"
        product={product}
        projectOptions={projects.map((item) => ({ slug: item.slug, name: item.name }))}
      />
    </AdminShell>
  );
}
