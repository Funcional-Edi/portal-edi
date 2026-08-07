import { getProject } from "@/modules/living-docs-externa/repository/project-repository";
import { readProjectSchemaSnapshot } from "@/modules/living-docs-externa/repository/schema-repository";
import type { Project } from "@/modules/living-docs-externa/schema";
import type { ProjectSchemaSnapshot } from "@/modules/living-docs-externa/schema/introspection";

export type ExportAccessErrorCode = "PROJECT_NOT_FOUND" | "NOT_PUBLISHED";

export class ExportAccessError extends Error {
  constructor(
    public readonly code: ExportAccessErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ExportAccessError";
  }
}

export interface ProjectExportContext {
  project: Project;
  schema: ProjectSchemaSnapshot | null;
}

/** Carrega projeto + schema para export. Admin vê rascunho; distribuidor só publicado. */
export async function resolveProjectForExport(
  slug: string,
  options: { isAdmin: boolean }
): Promise<ProjectExportContext> {
  const project = await getProject(slug);
  if (!project) {
    throw new ExportAccessError(
      "PROJECT_NOT_FOUND",
      `Projeto "${slug}" não encontrado.`
    );
  }

  if (!options.isAdmin && !project.config.published) {
    throw new ExportAccessError(
      "NOT_PUBLISHED",
      `Manual "${slug}" não está publicado.`
    );
  }

  const schema = await readProjectSchemaSnapshot(slug);
  return { project, schema };
}
