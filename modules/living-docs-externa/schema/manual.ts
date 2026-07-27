import { z } from "zod";

export const manualOperationKindSchema = z.enum(["query", "mutation"]);

export const manualOperationSchema = z.object({
  kind: manualOperationKindSchema,
  name: z.string().min(1),
  order: z.number().int().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  exampleQuery: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  businessNotes: z.array(z.string()).optional(),
  authRequired: z.boolean().optional(),
  relatedSections: z
    .array(
      z
        .string()
        .min(2)
        .max(64)
        .regex(/^[a-z0-9-]+$/)
    )
    .optional(),
});

export const integrationManualSchema = z.object({
  version: z.literal(1),
  title: z.string().min(1),
  productName: z.string().min(1).max(200).optional(),
  manualVersion: z.string().optional(),
  versionHistory: z
    .array(
      z.object({
        date: z.string().min(1).max(32),
        author: z.string().min(1).max(200),
        details: z.string().min(1).max(4000),
        version: z.string().min(1).max(32),
      })
    )
    .optional(),
  referenceTables: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        columns: z.array(z.string().min(1)),
        rows: z.array(z.array(z.string())),
      })
    )
    .optional(),
  operations: z.array(manualOperationSchema),
});

export type ManualOperationKind = z.infer<typeof manualOperationKindSchema>;
export type ManualOperation = z.infer<typeof manualOperationSchema>;
export type IntegrationManual = z.infer<typeof integrationManualSchema>;

export function sortOperations(manual: IntegrationManual): ManualOperation[] {
  return [...manual.operations].sort((a, b) => a.order - b.order);
}

export function findOperation(
  manual: IntegrationManual,
  kind: ManualOperationKind,
  name: string
): ManualOperation | undefined {
  return manual.operations.find((op) => op.kind === kind && op.name === name);
}
