import type { PortalModule } from "@/core/module-registry";

/**
 * Documentação viva EXTERNA (clientes/parceiros). Carro-chefe.
 * Gera documentação a partir do schema GraphQL (introspection) + conteúdo
 * curado. Substitui o PDF artesanal. Conteúdo versionável → capacidade "content".
 */
export const livingDocsExternaModule: PortalModule = {
  id: "living-docs-externa",
  title: "Documentação Viva (Clientes)",
  description:
    "Manuais de integração gerados do schema GraphQL e curados por produto, para parceiros.",
  status: "active",
  basePath: "/docs",
  access: "any",
  audience: "externo",
  requiresCapabilities: ["content"],
  nav: [{ label: "Documentação", href: "/docs", access: "any" }],
};
