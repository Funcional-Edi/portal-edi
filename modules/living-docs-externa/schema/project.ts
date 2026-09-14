import { z } from "zod";

import type { IntegrationManual } from "@/modules/living-docs-externa/schema/manual";
import { productFamilySchema, type ProductFamily } from "@/modules/living-docs-externa/schema/family";

/** Normaliza entrada comum (espaços, _, maiúsculas) antes de validar o slug. */
export function normalizeSlugInput(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const slugSchema = z
  .string()
  .transform(normalizeSlugInput)
  .pipe(
    z
      .string()
      .min(2, "Slug deve ter pelo menos 2 caracteres.")
      .max(64, "Slug deve ter no máximo 64 caracteres.")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug deve conter apenas letras minúsculas, números e hífens (ex.: edi-canais)."
      )
  );

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

/** GraphQL é o padrão histórico do portal; REST é o segundo protocolo suportado (ex.: PSP). */
export const projectProtocolSchema = z.enum(["graphql", "rest"]);

export type ProjectProtocol = z.infer<typeof projectProtocolSchema>;

export const projectConfigSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  /** Agrupamento visual no catálogo/admin (ex.: EDI Pharma, EDI Varejo). */
  family: productFamilySchema.optional(),
  environment: projectEnvironmentSchema.optional(),
  /** Protocolo de integração do produto. Default `graphql` preserva os projetos existentes. */
  protocol: projectProtocolSchema.default("graphql"),
  graphqlUrl: z.string().url().optional(),
  /** Só para `protocol: "rest"` — URL base da API (equivalente ao `graphqlUrl`). */
  apiBaseUrl: z.string().url().optional(),
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
  protocol: projectProtocolSchema.optional(),
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

/** Conexão de API REST (ex.: PSP) — sem mutation `createToken` para verificar. */
export const connectApiInputSchema = z.object({
  apiBaseUrl: z.string().url("URL da API inválida."),
  login: z.string().min(1, "Login é obrigatório."),
  password: z.string().min(1, "Senha é obrigatória."),
});

export type ConnectApiInput = z.infer<typeof connectApiInputSchema>;

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
  protocol: z.infer<typeof projectProtocolSchema>;
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
    protocol: config.protocol,
    gatewaySlug: config.gatewaySlug,
    published: config.published,
    manualStatus: config.manualStatus,
    updatedAt: config.updatedAt,
  };
}
