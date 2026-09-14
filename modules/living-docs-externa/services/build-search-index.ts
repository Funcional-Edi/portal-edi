import {
  getProject,
  listProjectSummaries,
  listPublishedProjectSummaries,
} from "@/modules/living-docs-externa/repository/project-repository";
import { listManualSections } from "@/modules/living-docs-externa/repository/section-repository";
import type { SearchIndexEntry } from "@/core/search/types";
import {
  docsGuideHref,
  docsOperationHref,
} from "@/modules/living-docs-externa/services/docs-routes";

function excerpt(text: string, max = 120): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}…`;
}

/** Monta índice de manuais publicados (ou todos, se admin). */
export async function buildLivingDocsSearchIndex(
  isAdmin: boolean
): Promise<SearchIndexEntry[]> {
  const summaries = isAdmin
    ? await listProjectSummaries()
    : await listPublishedProjectSummaries();

  const entries: SearchIndexEntry[] = [];

  for (const summary of summaries) {
    const project = await getProject(summary.slug);
    if (!project) continue;
    if (!isAdmin && !project.config.published) continue;

    const { manual, config } = project;

    entries.push({
      type: "manual",
      title: manual.title,
      href: docsGuideHref(config.slug),
      snippet: config.description,
      keywords: `${config.slug} ${config.name} ${manual.productName ?? ""}`,
    });

    const sections = await listManualSections(config.slug);
    for (const section of sections) {
      entries.push({
        type: "section",
        title: section.title,
        href: `${docsGuideHref(config.slug)}#section-${section.id}`,
        snippet: excerpt(section.body),
        keywords: `${config.slug} ${section.id}`,
      });
    }

    for (const op of manual.operations) {
      entries.push({
        type: "operation",
        title: op.title ?? op.name,
        href: docsOperationHref(config.slug, op.kind, op.name),
        snippet: op.description,
        keywords: `${op.kind} ${op.name} ${config.slug}`,
      });
    }
  }

  return entries;
}
