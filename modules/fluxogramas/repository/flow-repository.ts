import {
  projectConfigPath,
  projectFlowPath,
  projectManualPath,
  CONTENT_PATHS,
} from "@/core/db/adapters/content-paths";
import {
  listContentSubdirs,
  readContentJson,
  writeContentJson,
} from "@/core/db/adapters";
import {
  integrationFlowSchema,
  type IntegrationFlow,
} from "@/modules/fluxogramas/schema/flow";
import {
  manualRefSchema,
  projectConfigRefSchema,
  type ManualRef,
  type ProjectConfigRef,
} from "@/modules/fluxogramas/schema/project-ref";

export async function getProjectConfigRef(slug: string): Promise<ProjectConfigRef | null> {
  const raw = await readContentJson<unknown>(projectConfigPath(slug));
  if (!raw) return null;
  const result = projectConfigRefSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export async function getManualRef(slug: string): Promise<ManualRef | null> {
  const raw = await readContentJson<unknown>(projectManualPath(slug));
  if (!raw) return null;
  const result = manualRefSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export async function getIntegrationFlow(slug: string): Promise<IntegrationFlow | null> {
  const raw = await readContentJson<unknown>(projectFlowPath(slug));
  if (!raw) return null;
  const result = integrationFlowSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export async function integrationFlowExists(slug: string): Promise<boolean> {
  const flow = await getIntegrationFlow(slug);
  return flow !== null;
}

export async function saveIntegrationFlow(
  slug: string,
  flow: IntegrationFlow
): Promise<void> {
  await writeContentJson(projectFlowPath(slug), flow);
}

export async function listProjectSlugsWithFlow(): Promise<string[]> {
  const slugs = await listContentSubdirs(CONTENT_PATHS.projectsPrefix);
  const checks = await Promise.all(
    slugs.map(async (slug) => ((await integrationFlowExists(slug)) ? slug : null))
  );
  return checks.filter((slug): slug is string => slug !== null);
}

export interface PublishedFlowSummary {
  slug: string;
  name: string;
  description?: string;
  flowTitle: string;
}

export async function listPublishedFlowSummaries(): Promise<PublishedFlowSummary[]> {
  const slugs = await listProjectSlugsWithFlow();
  const entries = await Promise.all(
    slugs.map(async (slug): Promise<PublishedFlowSummary | null> => {
      const [config, flow] = await Promise.all([
        getProjectConfigRef(slug),
        getIntegrationFlow(slug),
      ]);
      if (!config?.published || !flow) return null;
      return {
        slug,
        name: config.name,
        description: config.description,
        flowTitle: flow.title,
      };
    })
  );

  return entries
    .filter((entry): entry is PublishedFlowSummary => entry !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}
