import type { ManualSection } from "@/modules/living-docs-externa/schema";
import { listManualSections } from "@/modules/living-docs-externa/repository/section-repository";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";

/**
 * Seções Markdown de um manual publicado.
 * Retorna [] se o projeto não existir / não estiver published.
 */
export async function getPublishedManualSections(
  slug: string
): Promise<ManualSection[]> {
  const project = await getPublishedManual(slug);
  if (!project) return [];
  return listManualSections(slug);
}
