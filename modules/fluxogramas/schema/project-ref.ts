import { z } from "zod";

/**
 * Leitura mínima de `config.json` sem depender de `living-docs-externa`
 * (módulos não se importam entre si).
 */
export const projectConfigRefSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  published: z.boolean().default(false),
});

export type ProjectConfigRef = z.infer<typeof projectConfigRefSchema>;

/** Leitura mínima de `manual.json` para validar `operationRef`. */
export const manualOperationRefSchema = z.object({
  kind: z.enum(["query", "mutation"]),
  name: z.string().min(1),
});

export const manualRefSchema = z.object({
  operations: z.array(manualOperationRefSchema),
});

export type ManualRef = z.infer<typeof manualRefSchema>;
