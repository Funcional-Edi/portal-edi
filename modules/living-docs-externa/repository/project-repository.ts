import {
  CONTENT_PATHS,
  projectConfigPath,
  projectManualPath,
} from "@/core/db/adapters/content-paths";
import {
  listContentSubdirs,
  readContentJson,
  writeContentJson,
} from "@/core/db/adapters";
import {
  integrationManualSchema,
  type IntegrationManual,
} from "@/modules/living-docs-externa/schema/manual";
import {
  projectConfigSchema,
  type Project,
  type ProjectSummary,
  toProjectSummary,
  type ProjectConfig,
} from "@/modules/living-docs-externa/schema/project";

function defaultManual(name: string): IntegrationManual {
  return {
    version: 1,
    title: `Manual de integração — ${name}`,
    operations: [],
  };
}

async function loadProjectFromStore(slug: string): Promise<Project | null> {
  const configRaw = await readContentJson<unknown>(projectConfigPath(slug));
  if (!configRaw) return null;

  const configResult = projectConfigSchema.safeParse(configRaw);
  if (!configResult.success) return null;

  const manualRaw = await readContentJson<unknown>(projectManualPath(slug));
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
  return listContentSubdirs(CONTENT_PATHS.projectsPrefix);
}

export async function getProject(slug: string): Promise<Project | null> {
  return loadProjectFromStore(slug);
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

export async function projectExists(slug: string): Promise<boolean> {
  const config = await readContentJson(projectConfigPath(slug));
  return config !== null;
}

export async function createProject(input: {
  slug: string;
  name: string;
  description?: string;
}): Promise<Project> {
  if (await projectExists(input.slug)) {
    throw new Error("PROJECT_ALREADY_EXISTS");
  }

  const now = new Date().toISOString();
  const config: ProjectConfig = {
    slug: input.slug,
    name: input.name,
    description: input.description,
    published: false,
    manualStatus: "draft",
    createdAt: now,
    updatedAt: now,
  };
  const manual = defaultManual(input.name);

  await writeContentJson(projectConfigPath(input.slug), config);
  await writeContentJson(projectManualPath(input.slug), manual);

  return { config, manual };
}
