import {
  CONTENT_PATHS,
  projectConfigPath,
  projectManualPath,
} from "@/core/db/adapters/content-paths";
import {
  listLocalSubdirs,
  readLocalJson,
} from "@/core/db/adapters/local-content-store";
import { getContentBackend } from "@/core/db/adapters";
import {
  integrationManualSchema,
  type IntegrationManual,
} from "@/modules/living-docs-externa/schema/manual";
import {
  projectConfigSchema,
  type Project,
  type ProjectSummary,
  toProjectSummary,
} from "@/modules/living-docs-externa/schema/project";

function defaultManual(name: string): IntegrationManual {
  return {
    version: 1,
    title: `Manual de integração — ${name}`,
    operations: [],
  };
}

async function loadProjectFromLocal(slug: string): Promise<Project | null> {
  const configRaw = await readLocalJson<unknown>(projectConfigPath(slug));
  if (!configRaw) return null;

  const configResult = projectConfigSchema.safeParse(configRaw);
  if (!configResult.success) return null;

  const manualRaw = await readLocalJson<unknown>(projectManualPath(slug));
  const manualResult = manualRaw
    ? integrationManualSchema.safeParse(manualRaw)
    : null;

  const manual =
    manualResult?.success === true
      ? manualResult.data
      : defaultManual(configResult.data.name);

  return { config: configResult.data, manual };
}

export async function listProjectSlugs(): Promise<string[]> {
  if (getContentBackend() !== "local") {
    throw new Error("GitHub content store ainda não implementado (Fase 2).");
  }
  return listLocalSubdirs(CONTENT_PATHS.projectsPrefix);
}

export async function getProject(slug: string): Promise<Project | null> {
  if (getContentBackend() !== "local") {
    throw new Error("GitHub content store ainda não implementado (Fase 2).");
  }
  return loadProjectFromLocal(slug);
}

export async function listProjectSummaries(): Promise<ProjectSummary[]> {
  const slugs = await listProjectSlugs();
  const summaries: ProjectSummary[] = [];

  for (const slug of slugs) {
    const project = await getProject(slug);
    if (project) summaries.push(toProjectSummary(project.config));
  }

  return summaries.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function listPublishedProjectSummaries(): Promise<ProjectSummary[]> {
  const all = await listProjectSummaries();
  return all.filter((p) => p.published);
}
