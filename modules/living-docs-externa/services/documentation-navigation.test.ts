import { describe, expect, it } from "vitest";

import { DOCUMENTATION_CONFIGURATION } from "@/modules/living-docs-externa/config/documentation-products";
import type { ProjectSummary } from "@/modules/living-docs-externa/schema";
import type { DocumentationConfiguration } from "@/modules/living-docs-externa/schema/documentation-navigation";
import { canViewDocumentation, documentationRouteSelection, resolveDocumentationNavigation } from "./documentation-navigation";

const manuals: ProjectSummary[] = ["im", "canal-autorizador", "wholesaler"].map((slug) => ({
  slug, name: slug, published: true, protocol: "graphql", environment: "homolog", updatedAt: "2026-09-16T00:00:00.000Z",
}));
const resolve = (config = DOCUMENTATION_CONFIGURATION, projects = manuals, role: "admin" | "client" = "client") =>
  resolveDocumentationNavigation(config, projects, { role });

describe("documentation navigation", () => {
  it("uses published manuals and keeps unknown/future routes disabled", () => {
    const view = resolve();
    expect(view.products.map((p) => p.label)).toEqual(["Credenciado", "Movimentação de Vidas", "Trade", "APS", "PBM"]);
    const trade = view.products.find((p) => p.id === "trade")!;
    expect(trade.actions[0].links.map((link) => link.href)).toEqual([
      "/docs/canal-autorizador", "/docs/wholesaler", null, "/docs/im",
    ]);
    expect(trade.actions[0].links.at(-1)?.environment).toBe("homolog");
    expect(view.products[0].actions[0].links.every((link) => !link.href && link.status === "no-documentation")).toBe(true);
  });

  it("removes links after unpublishing without changing the registry", () => {
    const view = resolve(undefined, manuals.map((manual) => ({ ...manual, published: false })));
    expect(view.products.flatMap((p) => p.actions.flatMap((a) => a.links)).every((link) => link.href === null)).toBe(true);
    expect(view.products.find((p) => p.id === "trade")?.status).toBe("no-documentation");
  });

  it("only offers request tests to admins and GraphQL manuals", () => {
    expect(resolve().products.every((p) => p.actions.every((a) => a.id !== "teste-de-requisicao"))).toBe(true);
    const admin = resolve(undefined, manuals.map((manual) => manual.slug === "wholesaler" ? { ...manual, protocol: "rest" } : manual), "admin");
    const request = admin.products.find((p) => p.id === "trade")!.actions.find((a) => a.id === "teste-de-requisicao")!;
    expect(request.links.find((link) => link.id === "im")?.href).toBe("/docs/im/playground");
    expect(request.links.find((link) => link.id === "wholesaler")?.href).toBeNull();
  });

  it("filters products, modules and actions centrally and preserves the original registry", () => {
    const config: DocumentationConfiguration = {
      ...DOCUMENTATION_CONFIGURATION,
      products: DOCUMENTATION_CONFIGURATION.products.map((p) => ({
        ...p,
        enabled: p.id !== "aps",
        order: -p.order,
        actions: p.actions.map((a) => ({ ...a, visible: a.id !== "roteiro-homologacao" })),
        modules: p.modules.map((m) => ({ ...m, access: m.id === "im" ? { organizationIds: ["org-a"] } : undefined })),
      })),
    };
    const view = resolve(config);
    expect(view.products.map((p) => p.id)).toEqual(["pbm", "trade", "movimentacao-de-vidas", "credenciado"]);
    expect(view.products.flatMap((p) => p.actions).some((a) => a.id === "roteiro-homologacao")).toBe(false);
    expect(view.products.flatMap((p) => p.actions.flatMap((a) => a.links)).some((m) => m.id === "im")).toBe(false);
    expect(DOCUMENTATION_CONFIGURATION.products[0].id).toBe("credenciado");
  });

  it("fails closed on missing SSO claims, even for admins", () => {
    const access = { roles: ["admin" as const], organizationIds: ["org"], clientIds: ["client"], userIds: ["user"], requiredPermission: "docs.trade.view" };
    expect(canViewDocumentation(access, { role: "admin" })).toBe(false);
    expect(canViewDocumentation(access, { role: "admin", organizationId: "org", clientId: "client", userId: "user", permissions: ["docs.trade.view"] })).toBe(true);
    expect(canViewDocumentation({ roles: [] }, { role: "admin" })).toBe(false);
  });

  it("does not expose disabled modules, development content or arbitrary configured URLs as links", () => {
    for (const change of [{ enabled: false }, { status: "development" as const }, { route: "https://example.com" }, { route: "/docs/inexistente" }]) {
      const config = { ...DOCUMENTATION_CONFIGURATION, products: DOCUMENTATION_CONFIGURATION.products.map((p) => ({
        ...p, modules: p.modules.map((m) => ({ ...m, ...change })),
      })) };
      expect(resolve(config).products.flatMap((p) => p.actions.flatMap((a) => a.links)).every((link) => link.href === null)).toBe(true);
    }
  });

  it("selects the product/module/action for deep links without prefix collisions", () => {
    const view = resolve(undefined, manuals, "admin");
    expect(documentationRouteSelection(view, "/docs/im/operations/mutation/createToken")).toEqual({ productId: "trade", actionId: "mutations", moduleId: "im" });
    expect(documentationRouteSelection(view, "/docs/im/playground")?.actionId).toBe("teste-de-requisicao");
    expect(documentationRouteSelection(view, "/docs/im")?.actionId).toBe("documentacao");
    expect(documentationRouteSelection(view, "/docs/api/im/types/Mutation")?.productId).toBe("trade");
    expect(documentationRouteSelection(view, "/docs/im-extra")).toBeNull();
  });
});
