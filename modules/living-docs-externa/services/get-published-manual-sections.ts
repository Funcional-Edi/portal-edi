import { cache } from "react";
import { unstable_cache } from "next/cache";

import { getContentBackend } from "@/core/db/adapters";
import { getProject } from "@/modules/living-docs-externa/repository/project-repository";
import { listManualSections } from "@/modules/living-docs-externa/repository/section-repository";
import type { ManualSection } from "@/modules/living-docs-externa/schema";
import {
  LIVING_DOCS_CACHE_KEYS,
  LIVING_DOCS_CACHE_TAGS,
} from "@/modules/living-docs-externa/services/cache-tags";

async function loadPublishedManualSections(slug: string): Promise<ManualSection[]> {
  const backend = getContentBackend();
  const getCachedSections = unstable_cache(
    async () => {
      const project = await getProject(slug);
      if (!project?.config.published) return [];
      return listManualSections(slug);
    },
    [LIVING_DOCS_CACHE_KEYS.getPublishedManualSections, backend, slug],
    { tags: [LIVING_DOCS_CACHE_TAGS.project(slug)] }
  );

  return getCachedSections();
}

/** Seções Markdown de um manual publicado. Dedupe via `cache()` na mesma request. */
export const getPublishedManualSections = cache(loadPublishedManualSections);
