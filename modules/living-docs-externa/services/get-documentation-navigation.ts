import "server-only";
import { cache } from "react";

import { auth } from "@/core/auth";
import { DOCUMENTATION_CONFIGURATION } from "@/modules/living-docs-externa/config/documentation-products";
import { resolveDocumentationNavigation } from "@/modules/living-docs-externa/services/documentation-navigation";
import { listPublishedManuals } from "@/modules/living-docs-externa/services/list-published-manuals";

/**
 * Server-side integration point for future validated admin overrides and SSO claims.
 * React cache deduplicates only within the request; never cache a user's permissions globally.
 * Session currently supplies role only. Missing granular claims fail closed in the resolver.
 */
export const getDocumentationNavigation = cache(async () => {
  const [session, manuals] = await Promise.all([auth(), listPublishedManuals()]);
  return resolveDocumentationNavigation(DOCUMENTATION_CONFIGURATION, manuals, {
    role: session?.user?.role,
    userId: session?.user?.id,
  });
});
