import { unstable_cache } from "next/cache";

import { getContentBackend } from "@/core/db/adapters";

/**
 * Arquivos locais devem refletir edições a cada request. React.cache nos leitores
 * ainda deduplica chamadas dentro da mesma renderização.
 * O CMS remoto tem revalidação periódica, além das tags usadas pelo admin.
 */
export function cachePublishedContent<T>(
  loader: () => Promise<T>,
  keyParts: string[],
  options: { tags: string[] }
): () => Promise<T> {
  if (getContentBackend() === "local") return loader;

  return unstable_cache(
    loader,
    [
      "living-docs:v2",
      process.env.GITHUB_REPO_OWNER?.trim() ?? "",
      process.env.GITHUB_REPO_NAME?.trim() ?? "",
      process.env.VERCEL_GIT_COMMIT_SHA ?? "",
      ...keyParts,
    ],
    { ...options, revalidate: 60 }
  );
}
