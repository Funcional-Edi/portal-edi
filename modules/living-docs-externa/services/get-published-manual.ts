import type { Project } from "@/modules/living-docs-externa/schema";
import { getProject } from "@/modules/living-docs-externa/repository/project-repository";

export async function getPublishedManual(slug: string): Promise<Project | null> {
  const project = await getProject(slug);
  if (!project?.config.published) return null;
  return project;
}
