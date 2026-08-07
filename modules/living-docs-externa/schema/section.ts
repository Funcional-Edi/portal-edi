import { z } from "zod";

/** Id da seção = nome do arquivo sem `.md` (ex.: visao-geral.md → visao-geral). */
export const sectionIdSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9-]+$/, "Section id must be lowercase alphanumeric with hyphens");

export const manualSectionSchema = z.object({
  id: sectionIdSchema,
  title: z.string().min(1),
  /** Conteúdo Markdown bruto (ainda não HTML). */
  body: z.string(),
});

export type ManualSection = z.infer<typeof manualSectionSchema>;

/** Limite de tamanho do Markdown de uma seção (evita payload abusivo no BFF). */
const SECTION_BODY_MAX = 100_000;

/** Entrada de criação de seção: id vira o nome do arquivo `.md`. */
export const createManualSectionInputSchema = z.object({
  id: sectionIdSchema,
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(SECTION_BODY_MAX).optional(),
});

/** Entrada de edição: só o corpo Markdown muda (o id é a identidade do arquivo). */
export const updateManualSectionInputSchema = z.object({
  body: z.string().min(1).max(SECTION_BODY_MAX),
});

export type CreateManualSectionInput = z.infer<typeof createManualSectionInputSchema>;
export type UpdateManualSectionInput = z.infer<typeof updateManualSectionInputSchema>;

/** Extrai o título do primeiro `# heading`, ou usa o id como fallback. */
export function titleFromMarkdown(body: string, fallbackId: string): string {
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallbackId;
}
