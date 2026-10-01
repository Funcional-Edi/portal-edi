import type { PortalModule } from "@/core/module-registry";

/** Perguntas frequentes de integração, mantidas como conteúdo versionado. */
export const faqModule: PortalModule = {
  id: "faq",
  title: "FAQ de Integração",
  description:
    "Respostas rápidas sobre produtos, subprodutos, ambientes e etapas da integração.",
  status: "active",
  basePath: "/faq",
  access: "client",
  audience: "externo",
  requiresCapabilities: ["content"],
  nav: [{ label: "FAQ", href: "/faq", access: "client" }],
};
