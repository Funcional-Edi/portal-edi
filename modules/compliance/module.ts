import type { PortalModule } from "@/core/module-registry";

/**
 * Módulo de compliance — painel interno de controles de proteção de dados,
 * confidencialidade e auditoria. Atualize `data/controls.ts` ao adicionar
 * novos controles de segurança.
 */
export const complianceModule: PortalModule = {
  id: "compliance",
  title: "Compliance",
  description:
    "Controles de proteção de dados, confidencialidade e status de conformidade do portal.",
  status: "active",
  basePath: "/compliance",
  access: "admin",
  audience: "interno",
  nav: [{ label: "Compliance", href: "/compliance", access: "admin" }],
};
