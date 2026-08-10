import "server-only";

import fs from "node:fs";
import path from "node:path";

import { getContentRoot } from "@/core/config/env";
import {
  permissionsConfigSchema,
  getPermissionsConfig as getPermissionsConfigFromEnv,
  getPermissionsConfigSource as getEnvPermissionsSource,
} from "@/core/auth/permissions-config";
import type { PermissionsConfig } from "@/core/auth/roles";

const PERMISSIONS_RELATIVE_PATH = "data/permissions.json";

/** Fonte efetiva de RBAC para health/smoke (arquivo > env > default). */
export function getEffectivePermissionsConfig(): PermissionsConfig {
  const filePath = path.join(getContentRoot(), PERMISSIONS_RELATIVE_PATH);
  if (!fs.existsSync(filePath)) {
    return getPermissionsConfigFromEnv();
  }

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
    const parsed = permissionsConfigSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn("[permissions] data/permissions.json inválido — usando env/defaults.");
      return getPermissionsConfigFromEnv();
    }
    return parsed.data;
  } catch {
    console.warn("[permissions] falha ao ler data/permissions.json — usando env/defaults.");
    return getPermissionsConfigFromEnv();
  }
}

export function getEffectivePermissionsSource(): "file" | "env" | "default" {
  const filePath = path.join(getContentRoot(), PERMISSIONS_RELATIVE_PATH);
  if (fs.existsSync(filePath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
      if (permissionsConfigSchema.safeParse(raw).success) return "file";
    } catch {
      /* fallback below */
    }
  }
  const envSource = getEnvPermissionsSource();
  return envSource === "env" ? "env" : "default";
}
