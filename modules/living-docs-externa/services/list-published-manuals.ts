import type { ProjectSummary } from "@/modules/living-docs-externa/schema";
import { listPublishedProjectSummaries } from "@/modules/living-docs-externa/repository/project-repository";

/** Manuais visíveis ao distribuidor (published: true). */
export async function listPublishedManuals(): Promise<ProjectSummary[]> {
  return listPublishedProjectSummaries();
}
