import { z } from "zod";

import type { IntegrationManual } from "@/modules/living-docs-externa/schema/manual";
import { productFamilySchema, type ProductFamily } from "@/modules/living-docs-externa/schema/family";

export const slugSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens");

export const projectEnvironmentSchema = z.enum([
  "homolog",
  "production",
  "sandbox",
]);

export const projectAudienceSchema = z.enum(["distribuidor", "interno"]);

export const projectManualStatusSchema = z.enum([
  "draft",
  "published",
  "needs-review",
]);

export const projectConfigSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  /** Agrupamento visual no catálogo/admin (ex.: EDI Pharma, EDI Varejo). */
  family: productFamilySchema.optional(),
  environment: projectEnvironmentSchema.optional(),
  graphqlUrl: z.string().url().optional(),
  gatewaySlug: z.string().min(1).max(128).optional(),
  published: z.boolean().default(false),
  audience: projectAudienceSchema.optional(),
  manualStatus: projectManualStatusSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ProjectConfig = z.infer<typeof projectConfigSchema>;

export const createProjectInputSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  family: productFamilySchema.optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const updateProjectFamilyInputSchema = z.object({
  family: productFamilySchema,
});

export type UpdateProjectFamilyInput = z.infer<typeof updateProjectFamilyInputSchema>;

export const connectGatewayInputSchema = z.object({
  graphqlUrl: z.string().url("URL do gateway inválida."),
  login: z.string().min(1, "Login é obrigatório."),
  password: z.string().min(1, "Senha é obrigatória."),
  gatewaySlug: z.string().min(1).max(128).optional(),
});

export type ConnectGatewayInput = z.infer<typeof connectGatewayInputSchema>;

export const publishProjectInputSchema = z.object({
  published: z.boolean(),
});

export type PublishProjectInput = z.infer<typeof publishProjectInputSchema>;

export interface ProjectSummary {
  slug: string;
  name: string;
  description?: string;
  family?: ProductFamily;
  environment?: z.infer<typeof projectEnvironmentSchema>;
  gatewaySlug?: string;
  published: boolean;
  manualStatus?: z.infer<typeof projectManualStatusSchema>;
  updatedAt: string;
}

export interface Project {
  config: ProjectConfig;
  manual: IntegrationManual;
}

export function toProjectSummary(config: ProjectConfig): ProjectSummary {
  return {
    slug: config.slug,
    name: config.name,
    description: config.description,
    family: config.family,
    environment: config.environment,
    gatewaySlug: config.gatewaySlug,
    published: config.published,
    manualStatus: config.manualStatus,
    updatedAt: config.updatedAt,
  };
}
