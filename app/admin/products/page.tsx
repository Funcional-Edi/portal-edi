import Link from "next/link";

import { listCatalogProducts } from "@/modules/living-docs-externa/repository/catalog-product-repository";
import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";

export default async function AdminProductsPage() {
  const products = await listCatalogProducts();

  return (
    <AdminShell activeNavHref="/admin/products">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="mt-2 text-slate-600">
            O menu de documentação lê esta lista. O analista cria e altera o produto aqui.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
        >
          Novo produto
        </Link>
      </header>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Produto</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Id</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Integrações</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{product.id}</td>
                <td className="px-4 py-3 text-slate-600">{product.modules.length}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${product.id}`} className="font-medium text-brand-700 hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
