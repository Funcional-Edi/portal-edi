/**
 * Registro de módulos do portal. Cada bounded context declara seu contrato
 * (rota base, RBAC, navegação, capacidades de dados exigidas). Navegação, RBAC
 * e a "planta viva" do portal derivam daqui — sem listas duplicadas.
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

const registry = new Map<string, PortalModule>();

export function registerModule(module: PortalModule): void {
  if (registry.has(module.id)) {
    throw new Error(`Módulo já registrado: "${module.id}"`);
  }
  registry.set(module.id, module);
}

export function listModules(): PortalModule[] {
  return Array.from(registry.values());
}

export function listActiveModules(): PortalModule[] {
  return listModules().filter((m) => m.status === "active");
}

export function getModule(id: string): PortalModule | undefined {
  return registry.get(id);
}

export function resetModuleRegistry(): void {
  registry.clear();
}
