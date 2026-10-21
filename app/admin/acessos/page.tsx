import { redirect } from "next/navigation";

import { AccessEditor } from "@/app/admin/acessos/access-editor";
import { auth, isAdminRole } from "@/core/auth";
import { loadAccessList } from "@/core/auth/access-list";
import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";

export default async function AdminAccessPage() {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) redirect("/");

  const config = await loadAccessList();

  return (
    <AdminShell activeNavHref="/admin/acessos">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Acessos</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Inclua o próximo admin master ou editor EDI pelo e-mail exato. Quem não estiver
          nestas listas entra como visualizador. A lista fica salva no portal, no mesmo
          formato da variável PERMISSIONS_CONFIG_JSON. Essa variável só serve para o
          primeiro admin, enquanto a lista ainda não foi salva. A mudança vale no próximo login.
        </p>
      </header>
      <AccessEditor admins={config.admins} editors={config.editors} />
    </AdminShell>
  );
}
