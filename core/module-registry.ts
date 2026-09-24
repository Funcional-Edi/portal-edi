/**
 * Contrato dos módulos do portal. Cada bounded context declara sua rota base,
 * RBAC, navegação e capacidades de dados exigidas.
 */

import type { DataCapability } from "@/core/db";

export type ModuleStatus = "active" | "planned";
export type ModuleAccess = "admin" | "client" | "any";

export interface ModuleNavItem {
  label: string;
  href: string;
  access?: ModuleAccess;
}

export interface PortalModule {
  id: string;
  title: string;
  description: string;
  status: ModuleStatus;
  basePath: string;
  access: ModuleAccess;
  /** Público-alvo: interno (time EDI) ou externo (clientes) ou ambos. */
  audience: "interno" | "externo" | "ambos";
  requiresCapabilities?: DataCapability[];
  nav?: ModuleNavItem[];
}
