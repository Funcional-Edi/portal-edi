import { revalidateTag } from "next/cache";

import type { Project } from "@/modules/living-docs-externa/schema";
import { createProjectInputSchema } from "@/modules/living-docs-externa/schema/project";
import { createProject as createProjectInStore } from "@/modules/living-docs-externa/repository/project-repository";
import { LIVING_DOCS_CACHE_TAGS } from "@/modules/living-docs-externa/services/cache-tags";

export type CreateProjectErrorCode = "VALIDATION" | "ALREADY_EXISTS";

export class CreateProjectError extends Error {
  constructor(
    public readonly code: CreateProjectErrorCode,
    message: string
  ) {
    super(message);
    this.name = "CreateProjectError";
  }
}

export async function createProject(input: unknown): Promise<Project> {
  const parsed = createProjectInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new CreateProjectError("VALIDATION", parsed.error.message);
  }

  try {
    const project = await createProjectInStore(parsed.data);
    revalidateTag(LIVING_DOCS_CACHE_TAGS.projects);
    revalidateTag(LIVING_DOCS_CACHE_TAGS.project(parsed.data.slug));
    return project;
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_ALREADY_EXISTS") {
      throw new CreateProjectError("ALREADY_EXISTS", `Projeto "${parsed.data.slug}" já existe.`);
    }
    throw error;
  }
}
