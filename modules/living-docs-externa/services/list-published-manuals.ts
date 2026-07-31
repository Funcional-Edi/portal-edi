import type { ProjectSummary } from "@/modules/living-docs-externa/schema";
import { unstable_cache } from "next/cache";
import { getContentBackend } from "@/core/db/adapters";
import { listPublishedProjectSummaries } from "@/modules/living-docs-externa/repository/project-repository";
import {
  LIVING_DOCS_CACHE_KEYS,
  LIVING_DOCS_CACHE_TAGS,
} from "@/modules/living-docs-externa/services/cache-tags";

/** Manuais visíveis ao distribuidor (published: true). */
export async function listPublishedManuals(): Promise<ProjectSummary[]> {
  const backend = getContentBackend();
  const getCachedManuals = unstable_cache(
    async () => listPublishedProjectSummaries(),
    [LIVING_DOCS_CACHE_KEYS.listPublishedManuals, backend],
    { tags: [LIVING_DOCS_CACHE_TAGS.projects] }
  );

  return getCachedManuals();
}
