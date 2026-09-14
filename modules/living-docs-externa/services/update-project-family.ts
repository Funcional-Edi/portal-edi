/**
 * Reclassifica a família de um projeto existente (agrupamento visual no
 * catálogo/admin — ver `schema/family.ts`). Não afeta rotas nem credenciais.
 */

import { revalidateTag } from "next/cache";

import { updateProjectFamilyInputSchema } from "@/modules/living-docs-externa/schema/project";
import { updateProjectFamily as updateProjectFamilyInStore } from "@/modules/living-docs-externa/repository/project-repository";
import { LIVING_DOCS_CACHE_TAGS } from "@/modules/living-docs-externa/services/cache-tags";
import type { ProjectConfig } from "@/modules/living-docs-externa/schema/project";

export type UpdateProjectFamilyErrorCode = "VALIDATION" | "PROJECT_NOT_FOUND";

export class UpdateProjectFamilyError extends Error {
  constructor(
    public readonly code: UpdateProjectFamilyErrorCode,
    message: string
  ) {
    super(message);
    this.name = "UpdateProjectFamilyError";
  }
}

export async function setProjectFamily(slug: string, input: unknown): Promise<ProjectConfig> {
  const parsed = updateProjectFamilyInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new UpdateProjectFamilyError("VALIDATION", parsed.error.message);
  }

  let config: ProjectConfig;
  try {
    config = await updateProjectFamilyInStore(slug, parsed.data.family);
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
      throw new UpdateProjectFamilyError("PROJECT_NOT_FOUND", `Projeto "${slug}" não encontrado.`);
    }
    throw error;
  }

  revalidateTag(LIVING_DOCS_CACHE_TAGS.projects);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.project(slug));

  return config;
}
