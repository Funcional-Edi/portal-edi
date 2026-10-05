import { z } from "zod";

export const flowNodeTypeSchema = z.enum(["start", "operation", "decision", "end"]);

export const flowOperationRefSchema = z.object({
  kind: z.enum(["query", "mutation"]),
  name: z.string().min(1),
});

const flowPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const flowLaneSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(100),
  position: flowPositionSchema,
  width: z.number().positive(),
  height: z.number().positive(),
});

export const flowAnnotationSchema = z.object({
  id: z.string().min(1).max(64),
  text: z.string().min(1).max(300),
  position: flowPositionSchema,
  width: z.number().positive(),
  targetNodeId: z.string().min(1).max(64).optional(),
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
  sourceHandle: z.string().min(1).max(64).optional(),
  targetHandle: z.string().min(1).max(64).optional(),
  /** Rótulo em arestas de decisão (ex.: "Sim", "Não"). */
  label: z.string().max(64).optional(),
});

export const integrationFlowSchema = z.object({
  version: z.literal(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  nodes: z.array(flowNodeSchema).min(1),
  edges: z.array(flowEdgeSchema),
  lanes: z.array(flowLaneSchema).optional(),
  annotations: z.array(flowAnnotationSchema).optional(),
  updatedAt: z.string().datetime().optional(),
});

export const integrationFlowEntrySchema = integrationFlowSchema.extend({
  id: z.string().min(1).max(64),
});

export const integrationFlowDocumentSchema = z.union([
  integrationFlowSchema,
  z.object({
    version: z.literal(1),
    flows: z.array(integrationFlowEntrySchema).min(1),
  }),
]);

export type FlowNodeType = z.infer<typeof flowNodeTypeSchema>;
export type FlowOperationRef = z.infer<typeof flowOperationRefSchema>;
export type FlowLane = z.infer<typeof flowLaneSchema>;
export type FlowAnnotation = z.infer<typeof flowAnnotationSchema>;
export type FlowNode = z.infer<typeof flowNodeSchema>;
export type FlowEdge = z.infer<typeof flowEdgeSchema>;
export type IntegrationFlow = z.infer<typeof integrationFlowSchema>;
export type IntegrationFlowEntry = z.infer<typeof integrationFlowEntrySchema>;
export type IntegrationFlowDocument = z.infer<typeof integrationFlowDocumentSchema>;

/** Entrada de gravação — `updatedAt` é definido pelo service. */
export const saveIntegrationFlowInputSchema = integrationFlowSchema.omit({
  updatedAt: true,
});

export type SaveIntegrationFlowInput = z.infer<typeof saveIntegrationFlowInputSchema>;

export function normalizeIntegrationFlowDocument(
  document: IntegrationFlowDocument
): IntegrationFlowEntry[] {
  if ("flows" in document) return document.flows;
  return [{ id: "default", ...document }];
}
