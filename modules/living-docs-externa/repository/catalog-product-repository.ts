import { CONTENT_PATHS, catalogProductPath } from "@/core/db/adapters/content-paths";
import { listContentSubdirs, readContentJson, writeContentJson } from "@/core/db/adapters";
import {
  catalogProductSchema,
  type CatalogProduct,
} from "@/modules/living-docs-externa/schema/catalog-product";

export async function listCatalogProductIds(): Promise<string[]> {
  return listContentSubdirs(CONTENT_PATHS.productsPrefix);
}

export async function getCatalogProduct(id: string): Promise<CatalogProduct | null> {
  const raw = await readContentJson<unknown>(catalogProductPath(id));
  if (!raw) return null;
  const parsed = catalogProductSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function listCatalogProducts(): Promise<CatalogProduct[]> {
  const ids = await listCatalogProductIds();
  const products = await Promise.all(ids.map((id) => getCatalogProduct(id)));
  return products
    .filter((product): product is CatalogProduct => product !== null)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "pt-BR"));
}

export async function catalogProductExists(id: string): Promise<boolean> {
  return (await getCatalogProduct(id)) !== null;
}

export async function writeCatalogProduct(product: CatalogProduct): Promise<void> {
  await writeContentJson(catalogProductPath(product.id), product);
}
