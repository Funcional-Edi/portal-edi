import type { PortalModule } from "@/core/module-registry";

/** Referência técnica GraphQL (schema completo por produto) — complementa o manual curado. */
export const graphqlReferenceModule: PortalModule = {
  id: "graphql-reference",
  title: "Referência GraphQL",
  description:
    "Navegador read-only do schema GraphQL sincronizado por produto (snapshot de introspection).",
  status: "active",
  basePath: "/docs",
  access: "any",
  audience: "externo",
  requiresCapabilities: ["content"],
  nav: [{ label: "Referência API", href: "/docs/api", access: "any" }],
};
