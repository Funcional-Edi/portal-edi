import type { PortalModule } from "@/core/module-registry";

/** Referência técnica GraphQL (schema completo por produto) — complementa o manual curado. */
export const graphqlReferenceModule: PortalModule = {
  id: "graphql-reference",
  title: "Referência GraphQL",
  description:
    "Consulte os campos, tipos e operações GraphQL pela relação publicada de produto e subproduto.",
  status: "active",
  basePath: "/docs",
  access: "any",
  audience: "externo",
  requiresCapabilities: ["content"],
  nav: [{ label: "Referência GraphQL", href: "/docs/api", access: "any" }],
};
