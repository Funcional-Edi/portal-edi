import type { PortalModule } from "@/core/module-registry";

/**
 * Manuais/base viva INTERNA do time EDI. Processos, regras e conhecimento
 * operacional do time (distinto da doc externa de clientes).
 */
export const manuaisInternosModule: PortalModule = {
  id: "manuais-internos",
  title: "Manuais Internos (EDI)",
  description:
    "Base viva de processos, regras de negócio e conhecimento do time EDI.",
  status: "planned",
  basePath: "/interno",
  access: "admin",
  audience: "interno",
  requiresCapabilities: ["content"],
};
