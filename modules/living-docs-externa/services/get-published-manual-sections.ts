import type { ManualSection } from "@/modules/living-docs-externa/schema";
import { unstable_cache } from "next/cache";
import { getContentBackend } from "@/core/db/adapters";
import { listManualSections } from "@/modules/living-docs-externa/repository/section-repository";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";
import {
  LIVING_DOCS_CACHE_KEYS,
  LIVING_DOCS_CACHE_TAGS,
} from "@/modules/living-docs-externa/services/cache-tags";

/**
 * Seções Markdown de um manual publicado.
 * Retorna [] se o projeto não existir / não estiver published.
 */
export async function getPublishedManualSections(
  slug: string
): Promise<ManualSection[]> {
  const backend = getContentBackend();
  const getCachedSections = unstable_cache(
    async () => {
      const project = await getPublishedManual(slug);
      if (!project) return [];
      return listManualSections(slug);
    },
    [LIVING_DOCS_CACHE_KEYS.getPublishedManualSections, backend, slug],
    { tags: [LIVING_DOCS_CACHE_TAGS.project(slug)] }
  );

  return getCachedSections();
}
