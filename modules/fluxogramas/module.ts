import type { PortalModule } from "@/core/module-registry";

/**
 * Gerador de fluxogramas (BPMN/diagramas) dos fluxos de integração e processos.
 * Diagramas derivados do roteiro/manual (gerados, não desenhados à mão).
 */
export const fluxogramasModule: PortalModule = {
  id: "fluxogramas",
  title: "Fluxogramas",
  description:
    "Geração de diagramas de fluxo (integração e processos) a partir do conteúdo curado.",
  status: "planned",
  basePath: "/fluxogramas",
  access: "any",
  audience: "ambos",
  requiresCapabilities: ["content"],
};
