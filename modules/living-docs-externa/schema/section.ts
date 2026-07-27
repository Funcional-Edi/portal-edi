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

/** Extrai o título do primeiro `# heading`, ou usa o id como fallback. */
export function titleFromMarkdown(body: string, fallbackId: string): string {
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallbackId;
}
