import { z } from "zod";

import {
  DEFAULT_PERMISSIONS_CONFIG,
  type PermissionsConfig,
} from "@/core/auth/roles";

export const permissionsConfigSchema = z.object({
  admins: z.array(z.string().min(3)),
  clients: z.array(z.string().min(2)),
  defaultRole: z.enum(["admin", "client"]),
});

/**
 * RBAC sem `fs` — seguro para middleware/edge.
 * Ordem: `PERMISSIONS_CONFIG_JSON` (env) → defaults em código.
 *
 * Para homolog com arquivo, injete o JSON na env no deploy
 * (ver docs/migracao/deploy-homolog.md).
 */
export function getPermissionsConfig(): PermissionsConfig {
  const raw = process.env.PERMISSIONS_CONFIG_JSON?.trim();
  if (!raw) return DEFAULT_PERMISSIONS_CONFIG;

  try {
    const parsed = permissionsConfigSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.warn("[permissions] PERMISSIONS_CONFIG_JSON inválido — usando defaults.");
      return DEFAULT_PERMISSIONS_CONFIG;
    }
    return parsed.data;
  } catch {
    console.warn("[permissions] PERMISSIONS_CONFIG_JSON não é JSON válido — usando defaults.");
    return DEFAULT_PERMISSIONS_CONFIG;
  }
}

export function getPermissionsConfigSource(): "env" | "default" {
  const raw = process.env.PERMISSIONS_CONFIG_JSON?.trim();
  if (!raw) return "default";
  try {
    const parsed = permissionsConfigSchema.safeParse(JSON.parse(raw));
    return parsed.success ? "env" : "default";
  } catch {
    return "default";
  }
}
