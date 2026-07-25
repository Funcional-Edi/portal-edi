import { NextResponse } from "next/server";
import { validateEnv } from "@/core/config/env";
import { registerAllModules, listBlockedModules } from "@/modules/registry";

export const dynamic = "force-dynamic";

/**
 * Healthcheck da fundação: valida ambiente, lista módulos e alerta sobre os
 * bloqueados por falta de banco. Serve de smoke test e de "planta viva" técnica.
 */
export async function GET() {
  const envProblems = validateEnv();
  const modules = registerAllModules();
  const blocked = listBlockedModules().map((entry) => ({
    id: entry.module.id,
    missingCapabilities: entry.missing,
  }));

  return NextResponse.json({
    status: envProblems.length === 0 ? "ok" : "degraded",
    time: new Date().toISOString(),
    env: { problems: envProblems },
    modules: modules.map((m) => ({
      id: m.id,
      status: m.status,
      basePath: m.basePath,
    })),
    blockedModules: blocked,
  });
}
