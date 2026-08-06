import { cache } from "react";
import { unstable_cache } from "next/cache";

import { getContentBackend } from "@/core/db/adapters";
import { listPublishedProjectSummaries } from "@/modules/living-docs-externa/repository/project-repository";
import type { ProjectSummary } from "@/modules/living-docs-externa/schema";
import {
  LIVING_DOCS_CACHE_KEYS,
  LIVING_DOCS_CACHE_TAGS,
} from "@/modules/living-docs-externa/services/cache-tags";

async function loadPublishedManuals(): Promise<ProjectSummary[]> {
  const backend = getContentBackend();
  const getCachedManuals = unstable_cache(
    async () => listPublishedProjectSummaries(),
    [LIVING_DOCS_CACHE_KEYS.listPublishedManuals, backend],
    { tags: [LIVING_DOCS_CACHE_TAGS.projects] }
  );

  return getCachedManuals();
}

/** Manuais visíveis ao distribuidor (published: true). */
export const listPublishedManuals = cache(loadPublishedManuals);
