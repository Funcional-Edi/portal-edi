import type { ProjectSummary } from "@/modules/living-docs-externa/schema";
import { listProjectSummaries } from "@/modules/living-docs-externa/repository/project-repository";

/** Lista todos os projetos (admin — inclui rascunhos e não publicados). */
export async function listProjects(): Promise<ProjectSummary[]> {
  return listProjectSummaries();
}
