import { NextResponse } from "next/server";

import { getEffectivePermissionsSource } from "@/core/auth/permissions-loader";
import { validateEnv } from "@/core/config/env";
import {
  getContentBackend,
  isGitHubContentConfigured,
} from "@/core/db/adapters";
import { registerAllModules, listBlockedModules } from "@/modules/registry";

export const dynamic = "force-dynamic";

/**
 * Healthcheck da fundação: valida ambiente, lista módulos e alerta sobre os
 * bloqueados por falta de banco. Serve de smoke test e de "planta viva" técnica.
 */
export async function GET() {
  const envProblems = validateEnv();
  const modules = registerAllModules();
  const activeModules = modules.filter((m) => m.status === "active");
  const blocked = listBlockedModules().map((entry) => ({
    id: entry.module.id,
    missingCapabilities: entry.missing,
  }));

  return NextResponse.json({
    status: envProblems.length === 0 ? "ok" : "degraded",
    time: new Date().toISOString(),
    env: { problems: envProblems },
    content: {
      backend: getContentBackend(),
      githubConfigured: isGitHubContentConfigured(),
    },
    rbac: {
      permissionsSource: getEffectivePermissionsSource(),
    },
    modules: modules.map((m) => ({
      id: m.id,
      status: m.status,
      basePath: m.basePath,
    })),
    summary: {
      active: activeModules.length,
      planned: modules.filter((m) => m.status === "planned").length,
      blocked: blocked.length,
    },
    blockedModules: blocked,
  });
}
