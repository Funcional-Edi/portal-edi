import type { PortalModule } from "@/core/module-registry";

/** Referência técnica GraphQL (schema completo por produto) — complementa o manual curado. */
export const graphqlReferenceModule: PortalModule = {
  id: "graphql-reference",
  title: "Referência GraphQL",
  description:
    "Consulte os campos, tipos e operações GraphQL disponíveis na referência publicada de cada produto.",
  status: "active",
  basePath: "/docs",
  access: "any",
  audience: "externo",
  requiresCapabilities: ["content"],
  nav: [{ label: "Referência API", href: "/docs/api", access: "any" }],
};
