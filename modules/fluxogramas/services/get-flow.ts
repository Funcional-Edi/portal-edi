import {
  getIntegrationFlow,
  getManualRef,
  getProjectConfigRef,
} from "@/modules/fluxogramas/repository/flow-repository";
import type { IntegrationFlow } from "@/modules/fluxogramas/schema";

export class GetFlowError extends Error {
  constructor(
    readonly code: "PROJECT_NOT_FOUND" | "FLOW_NOT_FOUND" | "NOT_PUBLISHED",
    message: string
  ) {
    super(message);
    this.name = "GetFlowError";
  }
}

export async function getProjectFlow(
  slug: string,
  options: { requirePublished?: boolean } = {}
): Promise<IntegrationFlow> {
  const config = await getProjectConfigRef(slug);
  if (!config) {
    throw new GetFlowError("PROJECT_NOT_FOUND", "Projeto não encontrado.");
  }

  if (options.requirePublished && !config.published) {
    throw new GetFlowError("NOT_PUBLISHED", "Fluxo não publicado.");
  }

  const flow = await getIntegrationFlow(slug);
  if (!flow) {
    throw new GetFlowError("FLOW_NOT_FOUND", "Fluxo não encontrado para este projeto.");
  }

  return flow;
}

export async function getProjectFlowContext(slug: string) {
  const [config, flow, manual] = await Promise.all([
    getProjectConfigRef(slug),
    getIntegrationFlow(slug),
    getManualRef(slug),
  ]);

  return { config, flow, manual };
}
