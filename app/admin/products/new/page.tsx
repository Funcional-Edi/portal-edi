import Link from "next/link";

import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";
import { CatalogProductForm } from "@/modules/living-docs-externa/ui/admin/catalog-product-form";

export default function NewCatalogProductPage() {
  return (
    <AdminShell activeNavHref="/admin/products">
      <header className="mb-8">
        <Link href="/admin/products" className="text-sm font-medium text-brand-700 hover:underline">
          ← Voltar para produtos
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Novo produto</h1>
        <p className="mt-2 text-slate-600">
          Entra no menu de documentação. As seções (visão geral, roteiro, fluxos) são as mesmas para todos.
        </p>
      </header>
      <CatalogProductForm mode="create" projectOptions={[]} />
    </AdminShell>
  );
}
