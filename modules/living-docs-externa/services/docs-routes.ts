import type { ProductFamily } from "@/modules/living-docs-externa/schema/family";
import type { ManualOperationKind } from "@/modules/living-docs-externa/schema/manual";

/** Entrada pública da documentação curada (famílias de produto). */
export const DOCS_HOME_HREF = "/docs";

export const DOCS_API_HREF = "/docs/api";

export const DOCS_JOURNEY_ANCHOR = "jornada-integracao";

export const FAQ_HREF = "/faq";

export const DOCS_NAV_ITEMS = [
  { href: DOCS_HOME_HREF, label: "Documentação" },
  { href: DOCS_API_HREF, label: "Referência GraphQL" },
  { href: FAQ_HREF, label: "FAQ" },
] as const;

export function docsFamilyHref(family: ProductFamily): string {
  return `${DOCS_HOME_HREF}/${family}`;
}

export function docsGuideHref(slug: string): string {
  return `${DOCS_HOME_HREF}/${slug}`;
}

export function docsJourneyHref(slug: string, anchor = DOCS_JOURNEY_ANCHOR): string {
  return `${docsGuideHref(slug)}#${anchor}`;
}

/** Aceita apenas retornos internos para uma âncora de jornada do mesmo produto. */
export function docsReturnHref(slug: string, returnTo?: string | string[]): string {
  const fallback = docsJourneyHref(slug);
  if (typeof returnTo !== "string") return fallback;

  const guideHref = docsGuideHref(slug);
  if (!returnTo.startsWith(`${guideHref}#jornada-`)) return fallback;
  return returnTo;
}

function appendReturnTo(href: string, returnTo?: string): string {
  return returnTo ? `${href}?returnTo=${encodeURIComponent(returnTo)}` : href;
}

export function schemaTypeHref(slug: string, typeName: string, returnTo?: string): string {
  return appendReturnTo(
    `${DOCS_API_HREF}/${slug}/types/${encodeURIComponent(typeName)}`,
    returnTo
  );
}

export function docsPlaygroundHref(slug: string, query?: string): string {
  const base = `${docsGuideHref(slug)}/playground`;
  if (!query?.trim()) return base;
  return `${base}?query=${encodeURIComponent(query)}`;
}

export function docsOperationHref(
  slug: string,
  kind: ManualOperationKind,
  name: string,
  returnTo?: string
): string {
  return appendReturnTo(`${docsGuideHref(slug)}/operations/${kind}/${name}`, returnTo);
}
