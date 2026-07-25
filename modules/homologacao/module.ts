import type { PortalModule } from "@/core/module-registry";

/**
 * Workflow de HOMOLOGAÇÃO de parceiros conduzido pelo time EDI.
 * Contexto transacional (máquina de estados, concorrência, auditoria) → exige
 * banco (`transactional` + `audit-log`), indisponível hoje. O registro sinaliza
 * o bloqueio até a decisão de banco (ADR-0002).
 */
export const homologacaoModule: PortalModule = {
  id: "homologacao",
  title: "Homologação",
  description: "Condução e acompanhamento de homologações de parceiros (time EDI).",
  status: "planned",
  basePath: "/homologacao",
  access: "admin",
  audience: "interno",
  requiresCapabilities: ["transactional", "audit-log"],
};
