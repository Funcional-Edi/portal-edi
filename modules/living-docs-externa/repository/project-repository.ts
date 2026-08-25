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
import type { ProductFamily } from "@/modules/living-docs-externa/schema/family";

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
  const projects = await Promise.all(slugs.map((slug) => getProject(slug)));

  const summaries = projects
    .filter((project): project is Project => project !== null)
    .map((project) => toProjectSummary(project.config));

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
  family?: ProductFamily;
}): Promise<Project> {
  if (await projectExists(input.slug)) {
    throw new Error("PROJECT_ALREADY_EXISTS");
  }

  const now = new Date().toISOString();
  const config: ProjectConfig = {
    slug: input.slug,
    name: input.name,
    description: input.description,
    family: input.family,
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

/** Atualiza os dados de conexão do gateway no `config.json` do projeto. */
export async function updateProjectGatewayConfig(
  slug: string,
  gateway: { graphqlUrl: string; gatewaySlug: string }
): Promise<ProjectConfig> {
  const project = await loadProjectFromStore(slug);
  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const config: ProjectConfig = {
    ...project.config,
    graphqlUrl: gateway.graphqlUrl,
    gatewaySlug: gateway.gatewaySlug,
    updatedAt: new Date().toISOString(),
  };

  await writeContentJson(projectConfigPath(slug), config);
  return config;
}

/** Alterna `published` (e `manualStatus` correspondente) no `config.json` do projeto. */
export async function updateProjectPublishStatus(
  slug: string,
  published: boolean
): Promise<ProjectConfig> {
  const project = await loadProjectFromStore(slug);
  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const config: ProjectConfig = {
    ...project.config,
    published,
    manualStatus: published ? "published" : "draft",
    updatedAt: new Date().toISOString(),
  };

  await writeContentJson(projectConfigPath(slug), config);
  return config;
}

export async function getManual(slug: string): Promise<IntegrationManual | null> {
  const project = await loadProjectFromStore(slug);
  return project?.manual ?? null;
}

/**
 * Sobrescreve `manual.json` do projeto. Só I/O — validação de schema e regras
 * (duplicidade, existência da operação etc.) ficam em
 * `services/manage-manual-operations.ts`.
 */
export async function writeManual(slug: string, manual: IntegrationManual): Promise<void> {
  if (!(await projectExists(slug))) {
    throw new Error("PROJECT_NOT_FOUND");
  }
  await writeContentJson(projectManualPath(slug), manual);
}

/** Reclassifica a família de um projeto existente no `config.json`. */
export async function updateProjectFamily(
  slug: string,
  family: ProductFamily
): Promise<ProjectConfig> {
  const project = await loadProjectFromStore(slug);
  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const config: ProjectConfig = {
    ...project.config,
    family,
    updatedAt: new Date().toISOString(),
  };

  await writeContentJson(projectConfigPath(slug), config);
  return config;
}

/** Atualiza apenas `updatedAt` no `config.json` de um projeto existente. */
export async function updateProjectConfigUpdatedAt(slug: string): Promise<ProjectConfig> {
  const project = await loadProjectFromStore(slug);
  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const config: ProjectConfig = {
    ...project.config,
    updatedAt: new Date().toISOString(),
  };

  await writeContentJson(projectConfigPath(slug), config);
  return config;
}
