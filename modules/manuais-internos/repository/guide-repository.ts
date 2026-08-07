import {
  INTERN_CONTENT_PATHS,
  internoGuidePath,
} from "@/core/db/adapters/content-paths";
import {
  listContentFiles,
  readContentText,
} from "@/core/db/adapters";
import {
  guideSlugSchema,
  titleFromMarkdown,
  type InternoGuide,
  type InternoGuideSummary,
} from "@/modules/manuais-internos/schema/guide";

export async function listGuideSlugs(): Promise<string[]> {
  const files = await listContentFiles(INTERN_CONTENT_PATHS.guidesPrefix);
  return files
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""))
    .filter((slug) => guideSlugSchema.safeParse(slug).success)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export async function listGuideSummaries(): Promise<InternoGuideSummary[]> {
  const slugs = await listGuideSlugs();
  const guides = await Promise.all(slugs.map((slug) => getGuide(slug)));
  return guides
    .filter((guide): guide is InternoGuide => guide !== null)
    .map((guide) => ({ slug: guide.slug, title: guide.title }));
}

export async function getGuide(slug: string): Promise<InternoGuide | null> {
  const slugResult = guideSlugSchema.safeParse(slug);
  if (!slugResult.success) return null;

  const body = await readContentText(internoGuidePath(slug));
  if (body === null) return null;

  return {
    slug,
    title: titleFromMarkdown(body, slug),
    body,
  };
}
