import { z } from "zod";

import { slugSchema } from "@/modules/living-docs-externa/schema/project";

export const catalogProductStatusSchema = z.enum([
  "published",
  "no-documentation",
  "development",
  "unavailable",
]);

export const catalogProductModuleSchema = z.object({
  id: slugSchema,
  label: z.string().min(1).max(200),
  order: z.number().int().min(1),
  /** Manual em `content/projects/<slug>/`. Vazio = integração ainda sem documentação. */
  projectSlug: slugSchema.optional(),
});

export const catalogProductSchema = z.object({
  id: slugSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(""),
  order: z.number().int().min(1),
  visible: z.boolean().default(true),
  status: catalogProductStatusSchema.default("no-documentation"),
  tag: z.string().max(80).optional(),
  modules: z.array(catalogProductModuleSchema).default([]),
});

export const createCatalogProductInputSchema = z.object({
  id: slugSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const updateCatalogProductInputSchema = catalogProductSchema.omit({ id: true });

export type CatalogProduct = z.infer<typeof catalogProductSchema>;
export type CatalogProductModule = z.infer<typeof catalogProductModuleSchema>;
export type CreateCatalogProductInput = z.infer<typeof createCatalogProductInputSchema>;
export type UpdateCatalogProductInput = z.infer<typeof updateCatalogProductInputSchema>;
