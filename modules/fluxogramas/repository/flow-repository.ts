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
  integrationFlowDocumentSchema,
  integrationFlowSchema,
  normalizeIntegrationFlowDocument,
  type IntegrationFlow,
  type IntegrationFlowEntry,
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

export async function getIntegrationFlows(slug: string): Promise<IntegrationFlowEntry[]> {
  const raw = await readContentJson<unknown>(projectFlowPath(slug));
  if (!raw) return [];
  const result = integrationFlowDocumentSchema.safeParse(raw);
  return result.success
    ? normalizeIntegrationFlowDocument(result.data).sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))
    : [];
}

export async function getIntegrationFlow(
  slug: string,
  flowId?: string
): Promise<IntegrationFlow | null> {
  const flows = await getIntegrationFlows(slug);
  const entry = flowId ? flows.find((flow) => flow.id === flowId) : flows[0];
  return entry ?? null;
}

export async function integrationFlowExists(slug: string): Promise<boolean> {
  return (await getIntegrationFlows(slug)).length > 0;
}

export async function saveIntegrationFlow(
  slug: string,
  flow: IntegrationFlow,
  flowId = "default"
): Promise<void> {
  const raw = await readContentJson<unknown>(projectFlowPath(slug));
  const document = raw ? integrationFlowDocumentSchema.safeParse(raw) : null;

  if (document?.success && "flows" in document.data) {
    const exists = document.data.flows.some((entry) => entry.id === flowId);
    if (!exists) throw new Error("Fluxo não encontrado.");
    await writeContentJson(projectFlowPath(slug), {
      ...document.data,
      flows: document.data.flows.map((entry) =>
        entry.id === flowId ? { id: entry.id, ...flow } : entry
      ),
    });
    return;
  }

  if (flowId !== "default") throw new Error("Fluxo não encontrado.");
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
  flowId: string;
  name: string;
  description?: string;
  flowTitle: string;
}

export async function listPublishedFlowSummaries(): Promise<PublishedFlowSummary[]> {
  const slugs = await listProjectSlugsWithFlow();
  const entries = await Promise.all(
    slugs.map(async (slug): Promise<PublishedFlowSummary[]> => {
      const [config, flows] = await Promise.all([
        getProjectConfigRef(slug),
        getIntegrationFlows(slug),
      ]);
      if (!config?.published || flows.length === 0) return [];
      return flows.map((flow) => ({
        slug,
        flowId: flow.id,
        name: config.name,
        description: config.description,
        flowTitle: flow.title,
      }));
    })
  );

  return entries
    .flat()
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR") || a.flowTitle.localeCompare(b.flowTitle, "pt-BR"));
}
