import type { ProjectSummary } from "@/modules/living-docs-externa/schema";
import type {
  DocumentationAccess,
  DocumentationAudience,
  DocumentationConfiguration,
  DocumentationItem,
  DocumentationLinkView,
  DocumentationNavigationView,
} from "@/modules/living-docs-externa/schema/documentation-navigation";
import { docsPlaygroundHref } from "@/modules/living-docs-externa/services/docs-routes";

/** Visibility is not route authorization; existing middleware/API guards still apply. */
export function canViewDocumentation(access: DocumentationAccess | undefined, audience: DocumentationAudience): boolean {
  if (!access) return true;
  const matches = (allowed: readonly string[] | undefined, value: string | undefined) =>
    allowed === undefined || (value !== undefined && allowed.includes(value));
  return matches(access.roles, audience.role)
    && matches(access.userIds, audience.userId)
    && matches(access.organizationIds, audience.organizationId)
    && matches(access.clientIds, audience.clientId)
    && (!access.requiredPermission || Boolean(audience.permissions?.includes(access.requiredPermission)));
}

const ordered = <T extends DocumentationItem>(items: readonly T[], audience: DocumentationAudience): T[] =>
  items.filter((item) => item.visible && canViewDocumentation(item.access, audience))
    .sort((a, b) => a.order - b.order);

export function resolveDocumentationNavigation(
  config: DocumentationConfiguration,
  manuals: readonly ProjectSummary[],
  audience: DocumentationAudience,
): DocumentationNavigationView {
  const published = new Map(manuals.filter((manual) => manual.published).map((manual) => [manual.slug, manual]));
  const products = ordered(config.products, audience).filter((product) => product.enabled).map((product) => {
    const modules = ordered(product.modules, audience);
    const actions = ordered(product.actions, audience).map((action) => ({
      id: action.id,
      label: action.label,
      tag: action.tag,
      links: modules.map((module): DocumentationLinkView => {
        const manual = module.projectSlug ? published.get(module.projectSlug) : undefined;
        const available = product.status === "published" && module.enabled && action.enabled
          && module.status === "published" && action.status === "published" && manual;
        // Routes are explicitly configured, and must belong to the published manual.
        const base = manual && module.route === `/docs/${manual.slug}` ? module.route : null;
        let href: string | null = null;
        if (available && base) {
          if (action.destination === "documentation") href = base;
          if (action.destination === "guide") href = `${base}#roteiro-integracao`;
          if (action.destination === "request-test" && audience.role === "admin" && manual.protocol === "graphql") {
            href = docsPlaygroundHref(manual.slug);
          }
        }
        return {
          id: module.id,
          label: module.label,
          href,
          projectSlug: manual?.slug,
          environment: manual?.environment,
          tag: module.tag,
          status: href ? "published" : !module.enabled || !action.enabled
            ? "unavailable" : module.status === "development" || action.status === "development"
              ? "development" : module.status === "unavailable" || action.status === "unavailable" || manual
                ? "unavailable" : "no-documentation",
        };
      }),
    }));
    return {
      id: product.id,
      label: product.label,
      description: product.description,
      tag: product.tag,
      status: actions.some((action) => action.links.some((link) => link.href))
        ? "published" as const : product.status === "published" ? "no-documentation" as const : product.status,
      actions,
    };
  });
  return { products };
}

/** Exact slug boundaries avoid activating IM for unrelated routes such as /docs/im-extra. */
export function documentationRouteSelection(view: DocumentationNavigationView, pathname: string, hash = "") {
  for (const product of view.products) {
    for (const action of product.actions) {
      for (const link of action.links) {
        if (!link.projectSlug) continue;
        const manual = `/docs/${link.projectSlug}`;
        const schema = `/docs/api/${link.projectSlug}`;
        if (pathname === manual || pathname.startsWith(`${manual}/`) || pathname === schema || pathname.startsWith(`${schema}/`)) {
          const actionId = pathname.startsWith(`${manual}/playground`) ? "teste-de-requisicao"
            : pathname.startsWith(`${manual}/operations/`) || hash === "#roteiro-integracao" ? "roteiro" : "documentacao";
          return { productId: product.id, actionId, moduleId: link.id };
        }
      }
    }
  }
  return null;
}
