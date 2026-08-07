import {
  getManualRef,
  getProjectConfigRef,
  saveIntegrationFlow as persistFlow,
} from "@/modules/fluxogramas/repository/flow-repository";
import {
  integrationFlowSchema,
  saveIntegrationFlowInputSchema,
  type IntegrationFlow,
  type SaveIntegrationFlowInput,
} from "@/modules/fluxogramas/schema";
import { validateIntegrationFlow } from "@/modules/fluxogramas/services/flow-validation";

export class SaveFlowError extends Error {
  constructor(
    readonly code: "PROJECT_NOT_FOUND" | "VALIDATION" | "FLOW_INVALID",
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "SaveFlowError";
  }
}

export async function saveProjectFlow(
  slug: string,
  input: unknown
): Promise<IntegrationFlow> {
  const config = await getProjectConfigRef(slug);
  if (!config) {
    throw new SaveFlowError("PROJECT_NOT_FOUND", "Projeto não encontrado.");
  }

  const parsed = saveIntegrationFlowInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new SaveFlowError("VALIDATION", "Dados do fluxo inválidos.", parsed.error.flatten());
  }

  const manual = await getManualRef(slug);
  const issues = validateIntegrationFlow(parsed.data, manual);
  if (issues.length > 0) {
    throw new SaveFlowError("FLOW_INVALID", "Fluxo inválido.", issues);
  }

  const flow: IntegrationFlow = {
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };

  const validated = integrationFlowSchema.parse(flow);
  await persistFlow(slug, validated);
  return validated;
}

export function createEmptyFlow(title: string): SaveIntegrationFlowInput {
  return {
    version: 1,
    title,
    description: "Fluxo de integração curado a partir do roteiro.",
    nodes: [
      {
        id: "start",
        type: "start",
        label: "Início",
        position: { x: 120, y: 40 },
      },
      {
        id: "end",
        type: "end",
        label: "Fim",
        position: { x: 120, y: 280 },
      },
    ],
    edges: [{ id: "e-start-end", source: "start", target: "end" }],
  };
}
