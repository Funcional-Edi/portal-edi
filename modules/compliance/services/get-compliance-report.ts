import { getEffectivePermissionsSource } from "@/core/auth/permissions-loader";
import { getRedisRestConfig } from "@/core/auth/redis-rest";
import { env, validateEnv } from "@/core/config/env";
import { runProductionSecurityChecks } from "@/core/security/production-checks";

import {
  COMPLIANCE_CATEGORY_LABELS,
  COMPLIANCE_CONTROLS,
  type ComplianceCategory,
  type ComplianceControl,
} from "@/modules/compliance/data/controls";

export interface ComplianceRuntimeCheck {
  id: string;
  ok: boolean;
  detail: string;
}

export interface ComplianceReport {
  controls: ComplianceControl[];
  runtimeChecks: ComplianceRuntimeCheck[];
  envProblems: string[];
  permissionsSource: "file" | "env" | "default";
  summary: {
    totalControls: number;
    activeControls: number;
    runtimeOk: number;
    runtimeTotal: number;
  };
  categories: Array<{
    id: ComplianceCategory;
    label: string;
    controls: ComplianceControl[];
  }>;
  lastUpdated: string;
}

export function getComplianceReport(): ComplianceReport {
  const envProblems = validateEnv();
  const permissionsSource = getEffectivePermissionsSource();
  const productionChecks = runProductionSecurityChecks();

  const runtimeChecks: ComplianceRuntimeCheck[] = [
    {
      id: "env-validation",
      ok: envProblems.length === 0,
      detail:
        envProblems.length === 0
          ? "Variáveis de ambiente obrigatórias OK."
          : envProblems.join(" "),
    },
    {
      id: "permissions-source",
      ok: !env.isProduction || permissionsSource !== "default",
      detail:
        permissionsSource === "default"
          ? "RBAC usando defaults — configure permissions.json ou PERMISSIONS_CONFIG_JSON."
          : `RBAC carregado de: ${permissionsSource}.`,
    },
    {
      id: "rate-limit-backend",
      ok: !env.isProduction || !!getRedisRestConfig(),
      detail: getRedisRestConfig()
        ? "Rate limit com Redis REST."
        : "Rate limit em memória (OK em dev; configure KV_REST em prod).",
    },
    ...productionChecks.map((check) => ({
      id: check.id,
      ok: check.ok,
      detail: check.detail,
    })),
  ];

  const categories = (
    Object.entries(COMPLIANCE_CATEGORY_LABELS) as Array<[ComplianceCategory, string]>
  ).map(([id, label]) => ({
    id,
    label,
    controls: COMPLIANCE_CONTROLS.filter((control) => control.category === id),
  }));

  const activeControls = COMPLIANCE_CONTROLS.filter((c) => c.status === "ativo").length;
  const runtimeOk = runtimeChecks.filter((c) => c.ok).length;

  return {
    controls: COMPLIANCE_CONTROLS,
    runtimeChecks,
    envProblems,
    permissionsSource,
    summary: {
      totalControls: COMPLIANCE_CONTROLS.length,
      activeControls,
      runtimeOk,
      runtimeTotal: runtimeChecks.length,
    },
    categories,
    lastUpdated: "2026-08-10",
  };
}
