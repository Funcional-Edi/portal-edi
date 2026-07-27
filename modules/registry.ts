/**
 * Wiring dos módulos no registro central. Módulos planejados que exijam
 * capacidades de dados indisponíveis aparecem em `listBlockedModules()` — o
 * "alerta" de que é preciso decidir sobre banco antes de ativá-los (ADR-0002).
 */

import { isDatabaseAvailable, type DataCapability } from "@/core/db";
import {
  listModules,
  registerModule,
  resetModuleRegistry,
  type PortalModule,
} from "@/core/module-registry";

import { livingDocsExternaModule } from "@/modules/living-docs-externa/module";
import { manuaisInternosModule } from "@/modules/manuais-internos/module";
import { fluxogramasModule } from "@/modules/fluxogramas/module";
import { homologacaoModule } from "@/modules/homologacao/module";
import { assistenteIaModule } from "@/modules/assistente-ia/module";

const ALL_MODULES: PortalModule[] = [
  livingDocsExternaModule,
  manuaisInternosModule,
  fluxogramasModule,
  homologacaoModule,
  assistenteIaModule,
];

/** Registra todos os módulos conhecidos. Idempotente. */
export function registerAllModules(): PortalModule[] {
  resetModuleRegistry();
  for (const portalModule of ALL_MODULES) registerModule(portalModule);
  return listModules();
}

export function missingCapabilities(portalModule: PortalModule): DataCapability[] {
  return (portalModule.requiresCapabilities ?? []).filter(
    (c) => !isDatabaseAvailable(c)
  );
}

export function listBlockedModules(): Array<{
  module: PortalModule;
  missing: DataCapability[];
}> {
  return ALL_MODULES.map((portalModule) => ({
    module: portalModule,
    missing: missingCapabilities(portalModule),
  })).filter((entry) => entry.missing.length > 0);
}
