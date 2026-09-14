import { z } from "zod";

export const manualOperationKindSchema = z.enum(["query", "mutation", "rest"]);

export const restMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

/** Forma "crua" (sem o refine cross-field) — usada para `.extend`/`.omit` em inputs derivados. */
export const manualOperationShapeSchema = z.object({
  kind: manualOperationKindSchema,
  name: z.string().min(1),
  order: z.number().int().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  exampleQuery: z.string().optional(),
  /** Só para `kind: "rest"` — método HTTP do endpoint. */
  method: restMethodSchema.optional(),
  /** Só para `kind: "rest"` — caminho do endpoint (ex.: `/wsAutorizacao/service.asmx/Autoriza`). */
  path: z.string().optional(),
  /** Só para `kind: "rest"` — corpo de exemplo da requisição (JSON/texto). */
  exampleBody: z.string().optional(),
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

function requireRestFields(
  operation: { kind: string; method?: string; path?: string },
  ctx: z.RefinementCtx
): void {
  if (operation.kind !== "rest") return;
  if (!operation.method) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Operação REST precisa de `method`.",
      path: ["method"],
    });
  }
  if (!operation.path?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Operação REST precisa de `path`.",
      path: ["path"],
    });
  }
}

export const manualOperationSchema = manualOperationShapeSchema.superRefine(requireRestFields);

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

/** Entrada de criação: `order` é opcional (auto-atribuído se ausente). */
export const createManualOperationInputSchema = manualOperationShapeSchema
  .extend({
    order: z.number().int().min(1).optional(),
  })
  .superRefine(requireRestFields);

/**
 * Entrada de edição: `kind`/`name` identificam a operação e não são editáveis aqui.
 * O `kind` (e portanto a exigência de `method`/`path` para REST) não muda depois de
 * criada — não repetimos o refine aqui.
 */
export const updateManualOperationInputSchema = manualOperationShapeSchema.omit({
  kind: true,
  name: true,
});

/** Cabeçalho do manual editável no editor (etapa 6.2). Operações têm rota própria. */
export const updateManualMetadataInputSchema = integrationManualSchema.pick({
  title: true,
  productName: true,
  manualVersion: true,
});

export type ManualOperationKind = z.infer<typeof manualOperationKindSchema>;
export type ManualOperation = z.infer<typeof manualOperationSchema>;
export type IntegrationManual = z.infer<typeof integrationManualSchema>;
export type CreateManualOperationInput = z.infer<typeof createManualOperationInputSchema>;
export type UpdateManualOperationInput = z.infer<typeof updateManualOperationInputSchema>;
export type UpdateManualMetadataInput = z.infer<typeof updateManualMetadataInputSchema>;

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
