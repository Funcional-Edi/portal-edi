/**
 * Checagens de segurança em runtime (server-only — pode usar fs).
 * Usado pelo health detalhado e pelo módulo de compliance.
 */

import { getPermissionsConfigSource } from "@/core/auth/permissions-config";
import { getRedisRestConfig } from "@/core/auth/redis-rest";
import { env } from "@/core/config/env";

export interface ProductionSecurityCheck {
  id: string;
  ok: boolean;
  detail: string;
}

function hasLocalEmergencyConfigured(): boolean {
  return !!process.env.LOCAL_EMERGENCY_ACCOUNTS_JSON?.trim();
}

export function runProductionSecurityChecks(): ProductionSecurityCheck[] {
  if (!env.isProduction) {
    return [{ id: "environment", ok: true, detail: "Ambiente de desenvolvimento — checagens de prod ignoradas." }];
  }

  const checks: ProductionSecurityCheck[] = [];

  const permissionsSource = getPermissionsConfigSource();
  checks.push({
    id: "rbac-configured",
    ok: permissionsSource !== "default",
    detail:
      permissionsSource === "default"
        ? "RBAC usando defaults em código — configure PERMISSIONS_CONFIG_JSON."
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
    id: "sso-allowlist",
    ok: !!process.env.SSO_URL_ALLOWED_HOSTS?.trim(),
    detail: process.env.SSO_URL_ALLOWED_HOSTS?.trim()
      ? "Allowlist de hosts de SSO definida."
      : "SSO_URL_ALLOWED_HOSTS ausente.",
  });

  checks.push({
    id: "local-emergency-account",
    ok: hasLocalEmergencyConfigured(),
    detail: hasLocalEmergencyConfigured()
      ? "Conta local de emergencia com MFA configurada."
      : "LOCAL_EMERGENCY_ACCOUNTS_JSON ausente em produção.",
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
