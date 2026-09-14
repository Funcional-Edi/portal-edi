import {
  PRODUCT_FAMILY_METADATA,
  PRODUCT_FAMILY_ORDER,
  type ProductFamily,
} from "@/modules/living-docs-externa/schema/family";

export interface FamilyGroup<T> {
  family: ProductFamily | "outros";
  label: string;
  description?: string;
  items: T[];
}

/**
 * Agrupa qualquer lista com `family` opcional em seções ordenadas pelo
 * registry (`PRODUCT_FAMILY_ORDER`). Itens sem família (legado ou ainda não
 * classificados) caem num bucket "Outros" ao final — nunca desaparecem do
 * catálogo.
 */
export function groupByFamily<T extends { family?: ProductFamily }>(
  items: T[]
): FamilyGroup<T>[] {
  const buckets = new Map<ProductFamily | "outros", T[]>();

  for (const item of items) {
    const key: ProductFamily | "outros" = item.family ?? "outros";
    const bucket = buckets.get(key);
    if (bucket) bucket.push(item);
    else buckets.set(key, [item]);
  }

  const groups: FamilyGroup<T>[] = PRODUCT_FAMILY_ORDER.filter((family) =>
    buckets.has(family)
  ).map((family) => {
    const metadata = PRODUCT_FAMILY_METADATA[family];
    return {
      family,
      label: metadata.name,
      description: metadata.description,
      items: buckets.get(family) ?? [],
    };
  });

  const outros = buckets.get("outros");
  if (outros?.length) {
    groups.push({ family: "outros", label: "Outros", items: outros });
  }

  return groups;
}
