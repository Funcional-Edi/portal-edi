import "server-only";
import { cache } from "react";

import { auth } from "@/core/auth";
import { listContentFiles, listContentSubdirs } from "@/core/db/adapters";
import { CONTENT_PATHS } from "@/core/db/adapters/content-paths";
import { DOCUMENTATION_CONFIGURATION } from "@/modules/living-docs-externa/config/documentation-products";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";
import { resolveDocumentationNavigation } from "@/modules/living-docs-externa/services/documentation-navigation";
import { listPublishedManuals } from "@/modules/living-docs-externa/services/list-published-manuals";

async function listProjectSlugsWithFlow(): Promise<string[]> {
  const slugs = await listContentSubdirs(CONTENT_PATHS.projectsPrefix);
  const checks = await Promise.all(
    slugs.map(async (slug) => {
      const files = await listContentFiles(`${CONTENT_PATHS.projectsPrefix}/${slug}`);
      return files.includes("flow.json") ? slug : null;
    }),
  );
  return checks.filter((slug): slug is string => slug !== null);
}

/**
 * Server-side integration point for future validated admin overrides and SSO claims.
 * React cache deduplicates only within the request; never cache a user's permissions globally.
 * Session currently supplies role only. Missing granular claims fail closed in the resolver.
 */
export const getDocumentationNavigation = cache(async () => {
  const [session, manuals, flowSlugs] = await Promise.all([
    auth(),
    listPublishedManuals(),
    listProjectSlugsWithFlow(),
  ]);
  const details = await Promise.all(
    manuals.map(async (manual) => [manual.slug, await getPublishedManual(manual.slug)] as const),
  );
  const operationsBySlug = new Map(
    details
      .filter((entry): entry is [string, NonNullable<(typeof entry)[1]>] => entry[1] !== null)
      .map(([slug, project]) => [slug, project.manual.operations] as const),
  );

  return resolveDocumentationNavigation(DOCUMENTATION_CONFIGURATION, manuals, {
    role: session?.user?.role,
    userId: session?.user?.id,
  }, operationsBySlug, new Set(flowSlugs));
});
