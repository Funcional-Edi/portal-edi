import { cache } from "react";
import { unstable_cache } from "next/cache";

import { getContentBackend } from "@/core/db/adapters";
import { getProject } from "@/modules/living-docs-externa/repository/project-repository";
import type { Project } from "@/modules/living-docs-externa/schema";
import {
  LIVING_DOCS_CACHE_KEYS,
  LIVING_DOCS_CACHE_TAGS,
} from "@/modules/living-docs-externa/services/cache-tags";

async function loadPublishedManual(slug: string): Promise<Project | null> {
  const backend = getContentBackend();
  const getCachedProject = unstable_cache(
    async () => {
      const project = await getProject(slug);
      if (!project?.config.published) return null;
      return project;
    },
    [LIVING_DOCS_CACHE_KEYS.getPublishedManual, backend, slug],
    { tags: [LIVING_DOCS_CACHE_TAGS.project(slug)] }
  );

  return getCachedProject();
}

/**
 * Manual publicado por slug. `cache()` deduplica chamadas na mesma request
 * (ex.: layout + page); `unstable_cache` persiste entre requests em produção.
 */
export const getPublishedManual = cache(loadPublishedManual);
