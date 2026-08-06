import { z } from "zod";

export const flowNodeTypeSchema = z.enum(["start", "operation", "decision", "end"]);

export const flowOperationRefSchema = z.object({
  kind: z.enum(["query", "mutation"]),
  name: z.string().min(1),
});

export const flowNodeSchema = z.object({
  id: z.string().min(1).max(64),
  type: flowNodeTypeSchema,
  label: z.string().min(1).max(200),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  /** Vínculo opcional com `manual.json` → `operations[]`. */
  operationRef: flowOperationRefSchema.optional(),
});

export const flowEdgeSchema = z.object({
  id: z.string().min(1).max(64),
  source: z.string().min(1).max(64),
  target: z.string().min(1).max(64),
  /** Rótulo em arestas de decisão (ex.: "Sim", "Não"). */
  label: z.string().max(64).optional(),
});

export const integrationFlowSchema = z.object({
  version: z.literal(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  nodes: z.array(flowNodeSchema).min(1),
  edges: z.array(flowEdgeSchema),
  updatedAt: z.string().datetime().optional(),
});

export type FlowNodeType = z.infer<typeof flowNodeTypeSchema>;
export type FlowOperationRef = z.infer<typeof flowOperationRefSchema>;
export type FlowNode = z.infer<typeof flowNodeSchema>;
export type FlowEdge = z.infer<typeof flowEdgeSchema>;
export type IntegrationFlow = z.infer<typeof integrationFlowSchema>;

/** Entrada de gravação — `updatedAt` é definido pelo service. */
export const saveIntegrationFlowInputSchema = integrationFlowSchema.omit({
  updatedAt: true,
});

export type SaveIntegrationFlowInput = z.infer<typeof saveIntegrationFlowInputSchema>;
