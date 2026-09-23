/**
 * Catálogo central dos módulos. Módulos planejados que exijam
 * capacidades de dados indisponíveis aparecem em `listBlockedModules()` — o
 * "alerta" de que é preciso decidir sobre banco antes de ativá-los (ADR-0002).
 */

import { isDatabaseAvailable, type DataCapability } from "@/core/db";
import type { PortalModule } from "@/core/module-registry";

import { livingDocsExternaModule } from "@/modules/living-docs-externa/module";
import { manuaisInternosModule } from "@/modules/manuais-internos/module";
import { fluxogramasModule } from "@/modules/fluxogramas/module";
import { homologacaoModule } from "@/modules/homologacao/module";
import { assistenteIaModule } from "@/modules/assistente-ia/module";
import { graphqlReferenceModule } from "@/modules/graphql-reference/module";
import { complianceModule } from "@/modules/compliance/module";

const ALL_MODULES: PortalModule[] = [
  livingDocsExternaModule,
  graphqlReferenceModule,
  manuaisInternosModule,
  fluxogramasModule,
  homologacaoModule,
  assistenteIaModule,
  complianceModule,
];

/** Retorna uma cópia dos módulos conhecidos. */
export function registerAllModules(): PortalModule[] {
  return [...ALL_MODULES];
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
