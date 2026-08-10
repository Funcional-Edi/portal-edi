import { NextResponse } from "next/server";

import { auth } from "@/core/auth";
import { isAdminRole } from "@/core/auth/roles";
import { getEffectivePermissionsSource } from "@/core/auth/permissions-loader";
import { validateEnv } from "@/core/config/env";
import { runProductionSecurityChecks } from "@/core/security/production-checks";
import {
  getContentBackend,
  isGitHubContentConfigured,
} from "@/core/db/adapters";
import { registerAllModules, listBlockedModules } from "@/modules/registry";

export const dynamic = "force-dynamic";

/**
 * Healthcheck da fundação.
 * - Público: resposta mínima (status + timestamp) — sem topologia interna.
 * - Admin autenticado: resposta detalhada para smoke test e auditoria.
 */
export async function GET() {
  const envProblems = validateEnv();
  const session = await auth();
  const isAdmin = session?.user?.role && isAdminRole(session.user.role);

  if (!isAdmin) {
    return NextResponse.json({
      status: envProblems.length === 0 ? "ok" : "degraded",
      time: new Date().toISOString(),
    });
  }

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
    productionSecurity: runProductionSecurityChecks(),
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
