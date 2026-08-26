import type { ProductFamily } from "@/modules/living-docs-externa/schema/family";
import type { ManualOperationKind } from "@/modules/living-docs-externa/schema/manual";

/** Entrada pública da documentação curada (famílias de produto). */
export const DOCS_HOME_HREF = "/docs";

export const DOCS_API_HREF = "/docs/api";

export const DOCS_NAV_ITEMS = [
  { href: DOCS_HOME_HREF, label: "Documentação" },
  { href: DOCS_API_HREF, label: "Referência API" },
] as const;

export function docsFamilyHref(family: ProductFamily): string {
  return `${DOCS_HOME_HREF}/${family}`;
}

export function docsGuideHref(slug: string): string {
  return `${DOCS_HOME_HREF}/${slug}`;
}

export function docsPlaygroundHref(slug: string, query?: string): string {
  const base = `${docsGuideHref(slug)}/playground`;
  if (!query?.trim()) return base;
  return `${base}?query=${encodeURIComponent(query)}`;
}

export function docsOperationHref(
  slug: string,
  kind: ManualOperationKind,
  name: string
): string {
  return `${docsGuideHref(slug)}/operations/${kind}/${name}`;
}
