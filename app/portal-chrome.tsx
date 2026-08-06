import { auth } from "@/core/auth";
import { CommandPalette } from "@/core/ui/command-palette";

/** Monta atalho Ctrl+K apenas para usuários autenticados. */
export async function PortalChrome() {
  const session = await auth();
  if (!session?.user) return null;
  return <CommandPalette />;
}
