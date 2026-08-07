import type { SearchIndexEntry } from "@/core/search/types";
import { listGuideSummaries, getGuide } from "@/modules/manuais-internos/repository/guide-repository";

function excerpt(text: string, max = 120): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}…`;
}

/** Índice de guias internos (somente admin enxuta estes resultados na API). */
export async function buildInternoSearchIndex(): Promise<SearchIndexEntry[]> {
  const summaries = await listGuideSummaries();
  const entries: SearchIndexEntry[] = [];

  for (const summary of summaries) {
    const guide = await getGuide(summary.slug);
    if (!guide) continue;

    entries.push({
      type: "guide",
      title: guide.title,
      href: `/interno/${guide.slug}`,
      snippet: excerpt(guide.body),
      keywords: `interno ${guide.slug}`,
    });
  }

  return entries;
}
