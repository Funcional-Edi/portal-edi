import Link from "next/link";
import { LogOut } from "lucide-react";

import { auth, signOut } from "@/core/auth";

/**
 * Slot de sessão do header: e-mail + "Sair" quando logado, "Entrar" quando
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
        href="/login"
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden text-slate-600 sm:inline">{session.user.email}</span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
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
