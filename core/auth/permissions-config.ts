import { z } from "zod";

import {
  DEFAULT_PERMISSIONS_CONFIG,
  type PermissionsConfig,
} from "@/core/auth/roles";

/** editors: só e-mail exato; regra de domínio (`@x.com`) invalida o parse. */
const exactEmail = z
  .string()
  .min(3)
  .refine((v) => !v.trim().startsWith("@"), "domínio não é permitido neste papel");

export const permissionsConfigSchema = z.object({
  admins: z.array(z.string().min(3)),
  editors: z.array(exactEmail).default([]),
  clients: z.array(z.string().min(2)),
  defaultRole: z.enum(["admin", "client"]),
});

/**
 * Bootstrap de RBAC quando a lista salva ainda não existe.
 * O login usa `loadAccessList` (arquivo data/access/permissions.json).
 * Esta função fica só com a variável: o middleware não lê arquivo.
 * Ordem da variável: `PERMISSIONS_CONFIG_JSON` → defaults em código.
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
