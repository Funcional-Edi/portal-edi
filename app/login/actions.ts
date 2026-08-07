"use server";

import { auth } from "@/core/auth";
import { resolvePostLoginPath } from "@/core/auth/module-access";
import { registerAllModules } from "@/modules/registry";

/** Resolve destino pós-login no servidor (sessão já atualizada após signIn). */
export async function getPostLoginPath(callbackUrl: string | null): Promise<string> {
  const session = await auth();
  const role = session?.user?.role ?? "client";
  return resolvePostLoginPath(role, callbackUrl, registerAllModules());
}
