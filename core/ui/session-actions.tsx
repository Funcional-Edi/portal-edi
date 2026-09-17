import Link from "next/link";
import { LogOut } from "lucide-react";

import { auth, signOut } from "@/core/auth";
import { Badge } from "@/core/ui/badge";

/**
 * Slot de sessão do header: perfil, e-mail e "Sair" quando logado, "Entrar" quando
 * não. Antes desta peça NÃO havia botão de logout em lugar nenhum do portal —
 * a única forma de encerrar a sessão era apagar o cookie manualmente (ver
 * `docs/migracao/decisoes-ui.md`, item "logout ausente").
 *
 * Server Component: lê a sessão direto (`auth()`), sem round-trip client.
 */
export async function SessionActions() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link
        href="/"
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        Entrar
      </Link>
    );
  }

  const isAdmin = session.user.role === "admin";
  const accessLabel = isAdmin ? "Administrador" : "Cliente";

  return (
    <div className="flex items-center gap-2 text-sm sm:gap-3">
      <div className="flex flex-col items-end gap-1">
        <span className="hidden max-w-56 truncate text-xs text-slate-600 xl:block" title={session.user.email ?? undefined}>{session.user.email}</span>
        <span aria-label={`Tipo de acesso: ${accessLabel}`} className="inline-flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Acesso</span>
          <Badge tone={isAdmin ? "brand" : "neutral"}>{accessLabel}</Badge>
        </span>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          Sair
        </button>
      </form>
    </div>
  );
}
