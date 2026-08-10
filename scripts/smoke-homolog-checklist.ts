#!/usr/bin/env tsx
/**
 * Smoke checklist automatizado para homolog (Fase 9).
 * Valida ambiente, conteúdo e módulos sem chamar SSO/gateway externos.
 *
 * Uso: npm run smoke:homolog
 */

import fs from "node:fs";
import path from "node:path";

import { getEffectivePermissionsSource } from "@/core/auth/permissions-loader";
import { env, getContentRoot, validateEnv } from "@/core/config/env";
import {
  getContentBackend,
  isGitHubContentConfigured,
} from "@/core/db/adapters";
import { registerAllModules, listBlockedModules } from "@/modules/registry";

interface CheckResult {
  id: string;
  ok: boolean;
  detail: string;
}

function check(id: string, ok: boolean, detail: string): CheckResult {
  return { id, ok, detail };
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(getContentRoot(), relativePath));
}

function runAutomatedChecks(): CheckResult[] {
  const envProblems = validateEnv();
  const modules = registerAllModules();
  const activeModules = modules.filter((m) => m.status === "active");
  const blocked = listBlockedModules();

  const imPublished = (() => {
    try {
      const raw = fs.readFileSync(
        path.join(getContentRoot(), "content/projects/im/config.json"),
        "utf8"
      );
      const config = JSON.parse(raw) as { published?: boolean };
      return config.published === true;
    } catch {
      return false;
    }
  })();

  return [
    check("env", envProblems.length === 0, envProblems.join(" ") || "Variáveis ok"),
    check(
      "sso-configured",
      env.isProduction
        ? Boolean(process.env.FUNCIONAL_SSO_GRAPHQL_URL?.trim())
        : Boolean(
            process.env.FUNCIONAL_SSO_GRAPHQL_URL?.trim() ||
              process.env.DEV_AUTH_ENABLED === "true"
          ),
      process.env.FUNCIONAL_SSO_GRAPHQL_URL
        ? "FUNCIONAL_SSO_GRAPHQL_URL definida"
        : env.isProduction
          ? "SSO obrigatório em produção"
          : "SSO ausente — ok se DEV_AUTH_ENABLED=true"
    ),
    check(
      "content-backend",
      true,
      `Backend CMS: ${getContentBackend()}${isGitHubContentConfigured() ? " (GitHub)" : " (local)"}`
    ),
    check(
      "permissions",
      true,
      `RBAC: ${getEffectivePermissionsSource()}`
    ),
    check(
      "module-living-docs",
      activeModules.some((m) => m.id === "living-docs-externa"),
      "living-docs-externa ativo"
    ),
    check(
      "content-im",
      fileExists("content/projects/im/config.json") && imPublished,
      imPublished ? "Projeto IM publicado" : "IM ausente ou não publicado"
    ),
    check(
      "blocked-modules-documented",
      blocked.every((b) => b.module.status === "planned"),
      `${blocked.length} módulo(s) bloqueado(s) por capability (esperado)`
    ),
  ];
}

const MANUAL_STEPS = [
  "1. Acesse `/` deslogado — formulário de login inline (não `/login`).",
  "2. Entre com usuário distribuidor SSO homolog.",
  "3. Confirme catálogo em `/manual` com IM — Inventário (homolog).",
  "4. Abra `/manual/im` — seções + roteiro + export Postman visível.",
  "5. Ctrl+K — busque createToken e navegue até a operação.",
  "6. Playground: execute query allowlisted; operação fora da lista → 403.",
  "7. Admin: `/admin/metrics` incrementa após execução no playground.",
];

function main(): void {
  const results = runAutomatedChecks();
  const failed = results.filter((r) => !r.ok);

  console.log("\n=== Smoke homolog — checks automatizados ===\n");
  for (const result of results) {
    const icon = result.ok ? "✓" : "✗";
    console.log(`${icon} [${result.id}] ${result.detail}`);
  }

  console.log("\n=== Passos manuais (SSO / gateway) ===\n");
  for (const step of MANUAL_STEPS) {
    console.log(step);
  }

  console.log("\nReferência: docs/migracao/fase-5-smoke-sso-homolog.md\n");

  if (failed.length > 0) {
    console.error(`Falhou: ${failed.length} check(s).`);
    process.exit(1);
  }

  console.log("Checks automatizados OK.");
}

main();
