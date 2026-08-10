/**
 * Checagens de segurança em runtime (server-only — pode usar fs).
 * Usado pelo health detalhado e pelo módulo de compliance.
 */

import { getEffectivePermissionsSource } from "@/core/auth/permissions-loader";
import { getRedisRestConfig } from "@/core/auth/redis-rest";
import { env } from "@/core/config/env";

export interface ProductionSecurityCheck {
  id: string;
  ok: boolean;
  detail: string;
}

export function runProductionSecurityChecks(): ProductionSecurityCheck[] {
  if (!env.isProduction) {
    return [{ id: "environment", ok: true, detail: "Ambiente de desenvolvimento — checagens de prod ignoradas." }];
  }

  const checks: ProductionSecurityCheck[] = [];

  const permissionsSource = getEffectivePermissionsSource();
  checks.push({
    id: "rbac-configured",
    ok: permissionsSource !== "default",
    detail:
      permissionsSource === "default"
        ? "RBAC usando defaults em código — configure data/permissions.json ou PERMISSIONS_CONFIG_JSON."
        : `RBAC configurado via ${permissionsSource}.`,
  });

  checks.push({
    id: "sso-configured",
    ok: env.isSsoConfigured,
    detail: env.isSsoConfigured
      ? "SSO corporativo configurado."
      : "FUNCIONAL_SSO_GRAPHQL_URL ausente em produção.",
  });

  checks.push({
    id: "gateway-allowlist",
    ok: !!process.env.GATEWAY_URL_ALLOWED_HOSTS?.trim(),
    detail: process.env.GATEWAY_URL_ALLOWED_HOSTS?.trim()
      ? "Allowlist de hosts de gateway definida."
      : "GATEWAY_URL_ALLOWED_HOSTS ausente — qualquer host HTTPS público é aceito.",
  });

  checks.push({
    id: "rate-limit-redis",
    ok: !!getRedisRestConfig(),
    detail: getRedisRestConfig()
      ? "Rate limit de login com Redis REST (durável entre instâncias)."
      : "Rate limit em memória local — não compartilha entre instâncias.",
  });

  checks.push({
    id: "dev-auth-disabled",
    ok: process.env.DEV_AUTH_ENABLED !== "true",
    detail:
      process.env.DEV_AUTH_ENABLED === "true"
        ? "DEV_AUTH_ENABLED=true em produção — proibido."
        : "Login dev desabilitado.",
  });

  return checks;
}
