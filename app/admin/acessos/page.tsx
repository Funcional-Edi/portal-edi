import { redirect } from "next/navigation";

import { AccessEditor } from "@/app/admin/acessos/access-editor";
import { auth, isAdminRole } from "@/core/auth";
import { loadFirstAccessMap } from "@/core/auth/first-access";
import { loadAccessList } from "@/core/auth/access-list";
import { loadStoredSsoConfig } from "@/core/auth/sso-config";
import { AdminShell } from "@/modules/living-docs-externa/ui/admin/admin-shell";

export default async function AdminAccessPage() {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) redirect("/");

  const config = await loadAccessList();
  const firstAccess = await loadFirstAccessMap();
  const ssoConfig = await loadStoredSsoConfig();

  return (
    <AdminShell activeNavHref="/admin/acessos">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Acessos</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Escolha o SSO e diga quem é admin master ou editor EDI nesse SSO.
          Quem não estiver na lista entra só para ler.
        </p>
      </header>
      <AccessEditor
        admins={config.admins}
        editors={config.editors}
        firstAccess={firstAccess}
        initialSsoUrl={ssoConfig?.url ?? process.env.FUNCIONAL_SSO_GRAPHQL_URL?.trim() ?? ""}
      />
    </AdminShell>
  );
}
