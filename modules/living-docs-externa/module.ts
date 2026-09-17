import type { PortalModule } from "@/core/module-registry";

/**
 * Documentação viva EXTERNA (clientes/parceiros). Carro-chefe.
 * Gera documentação a partir do schema GraphQL (introspection) + conteúdo
 * curado. Substitui o PDF artesanal. Conteúdo versionável → capacidade "content".
 */
export const livingDocsExternaModule: PortalModule = {
  id: "living-docs-externa",
  title: "Documentação de produtos",
  description:
    "Conheça os produtos, consulte as regras de negócio e siga os roteiros de integração publicados.",
  status: "active",
  basePath: "/docs",
  access: "any",
  audience: "externo",
  requiresCapabilities: ["content"],
  nav: [{ label: "Documentação", href: "/docs", access: "any" }],
};
