/**
 * Caminhos relativos ao CONTENT_ROOT (paridade com CMS legado).
 * Ver docs/migracao/mapa-documentacao-funcional.md §6.
 */

export const CONTENT_PATHS = {
  projectsPrefix: "content/projects",
  dataProjectsPrefix: "data/projects",
} as const;

export function projectConfigPath(slug: string): string {
  return `${CONTENT_PATHS.projectsPrefix}/${slug}/config.json`;
}

export function projectManualPath(slug: string): string {
  return `${CONTENT_PATHS.projectsPrefix}/${slug}/manual.json`;
}

export function projectSectionsDir(slug: string): string {
  return `${CONTENT_PATHS.projectsPrefix}/${slug}/sections`;
}

export function projectSchemaPath(slug: string): string {
  return `${CONTENT_PATHS.dataProjectsPrefix}/${slug}/schema.json`;
}

export type ContentBackend = "local" | "github";
