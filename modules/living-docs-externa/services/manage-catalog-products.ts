import { revalidateTag } from "next/cache";

import type { DocumentationConfiguration } from "@/modules/living-docs-externa/schema/documentation-navigation";
import {
  createCatalogProductInputSchema,
  updateCatalogProductInputSchema,
  type CatalogProduct,
} from "@/modules/living-docs-externa/schema/catalog-product";
import { DOCUMENTATION_CONFIGURATION } from "@/modules/living-docs-externa/config/documentation-products";
import {
  catalogProductExists,
  getCatalogProduct,
  listCatalogProducts,
  writeCatalogProduct,
} from "@/modules/living-docs-externa/repository/catalog-product-repository";
import { docsGuideHref } from "@/modules/living-docs-externa/services/docs-routes";
import { LIVING_DOCS_CACHE_TAGS } from "@/modules/living-docs-externa/services/cache-tags";

export type CatalogProductErrorCode = "VALIDATION" | "ALREADY_EXISTS" | "NOT_FOUND";

export class CatalogProductError extends Error {
  constructor(
    public readonly code: CatalogProductErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CatalogProductError";
  }
}

/**
 * Monta o menu `/docs` a partir dos produtos gravados em `content/products/`.
 * As ações (visão geral, roteiro, fluxos, teste de requisição) são o molde
 * fixo: o analista não cria tipo novo de seção.
 */
export function catalogToDocumentationConfiguration(
  products: readonly CatalogProduct[],
): DocumentationConfiguration {
  const actions = DOCUMENTATION_CONFIGURATION.products.find((product) => product.id === "trade")?.actions
    ?? DOCUMENTATION_CONFIGURATION.products[0]?.actions
    ?? [];

  return {
    clients: DOCUMENTATION_CONFIGURATION.clients,
    products: products.map((product) => ({
      id: product.id,
      label: product.name,
      description: product.description,
      order: product.order,
      enabled: true,
      visible: product.visible,
      status: product.status,
      tag: product.tag,
      actions,
      modules: product.modules.map((module) => ({
        id: module.id,
        label: module.label,
        order: module.order,
        projectSlug: module.projectSlug,
        enabled: true,
        visible: true,
        status: module.projectSlug ? "published" as const : "no-documentation" as const,
        route: module.projectSlug ? docsGuideHref(module.projectSlug) : null,
      })),
    })),
  };
}

export async function loadDocumentationConfiguration(): Promise<DocumentationConfiguration> {
  return catalogToDocumentationConfiguration(await listCatalogProducts());
}

export async function createCatalogProduct(input: unknown): Promise<CatalogProduct> {
  const parsed = createCatalogProductInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new CatalogProductError("VALIDATION", parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }
  if (await catalogProductExists(parsed.data.id)) {
    throw new CatalogProductError("ALREADY_EXISTS", `Produto "${parsed.data.id}" já existe.`);
  }

  const existing = await listCatalogProducts();
  const order = existing.reduce((max, product) => Math.max(max, product.order), 0) + 1;
  const product: CatalogProduct = {
    id: parsed.data.id,
    name: parsed.data.name,
    description: parsed.data.description ?? "",
    order,
    visible: true,
    status: "no-documentation",
    modules: [],
  };
  await writeCatalogProduct(product);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.projects);
  return product;
}

/** Grava o manual como integração (subproduto) do produto, sem duplicar o mesmo slug. */
export async function linkProjectToCatalogProduct(
  productId: string,
  project: { slug: string; name: string },
): Promise<void> {
  const current = await getCatalogProduct(productId);
  if (!current) return;
  if (current.modules.some((module) => module.projectSlug === project.slug || module.id === project.slug)) {
    return;
  }
  const order = current.modules.reduce((max, module) => Math.max(max, module.order), 0) + 1;
  await writeCatalogProduct({
    ...current,
    modules: [
      ...current.modules,
      { id: project.slug, label: project.name, order, projectSlug: project.slug },
    ],
  });
  revalidateTag(LIVING_DOCS_CACHE_TAGS.projects);
}

export async function updateCatalogProduct(id: string, input: unknown): Promise<CatalogProduct> {
  const current = await getCatalogProduct(id);
  if (!current) {
    throw new CatalogProductError("NOT_FOUND", `Produto "${id}" não encontrado.`);
  }
  const parsed = updateCatalogProductInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new CatalogProductError("VALIDATION", parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }
  const product: CatalogProduct = { ...parsed.data, id };
  await writeCatalogProduct(product);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.projects);
  return product;
}
