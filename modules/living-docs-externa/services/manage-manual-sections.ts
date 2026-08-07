/**
 * CRUD das seções Markdown de um manual (`sections/*.md`) — etapa 6.3/6.6.
 *
 * Espelha `manage-manual-operations.ts`: valida a entrada com Zod, delega o I/O
 * ao `section-repository` e revalida os caches de leitura publicada. O id da
 * seção é o nome do arquivo, então ele é a identidade e não pode ser editado —
 * renomear = criar outra seção.
 */

import { revalidateTag } from "next/cache";

import {
  createManualSectionInputSchema,
  sectionIdSchema,
  titleFromMarkdown,
  updateManualSectionInputSchema,
  type ManualSection,
} from "@/modules/living-docs-externa/schema/section";
import { projectExists, updateProjectConfigUpdatedAt } from "@/modules/living-docs-externa/repository/project-repository";
import {
  deleteManualSection,
  listManualSections,
  manualSectionExists,
  readManualSection,
  writeManualSection,
} from "@/modules/living-docs-externa/repository/section-repository";
import { LIVING_DOCS_CACHE_TAGS } from "@/modules/living-docs-externa/services/cache-tags";

export type ManageSectionErrorCode =
  | "VALIDATION"
  | "PROJECT_NOT_FOUND"
  | "SECTION_NOT_FOUND"
  | "SECTION_ALREADY_EXISTS";

export class ManageSectionError extends Error {
  constructor(
    public readonly code: ManageSectionErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ManageSectionError";
  }
}

async function assertProjectExists(slug: string): Promise<void> {
  if (!(await projectExists(slug))) {
    throw new ManageSectionError("PROJECT_NOT_FOUND", `Projeto "${slug}" não encontrado.`);
  }
}

/**
 * O id vem da URL e virou nome de arquivo — validar aqui impede path traversal
 * (`../../config.json`) antes de qualquer I/O.
 */
function parseSectionId(id: string): string {
  const parsed = sectionIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new ManageSectionError("VALIDATION", `Id de seção inválido: "${id}".`);
  }
  return parsed.data;
}

async function afterWrite(slug: string): Promise<void> {
  await updateProjectConfigUpdatedAt(slug);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.projects);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.project(slug));
}

/** Seções do manual para o admin (sem gate de `published`). */
export async function listDraftManualSections(slug: string): Promise<ManualSection[]> {
  await assertProjectExists(slug);
  return listManualSections(slug);
}

/** Cria uma seção nova. Sem `body`, gera um esqueleto com o `# título`. */
export async function addManualSection(slug: string, input: unknown): Promise<ManualSection> {
  const parsed = createManualSectionInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ManageSectionError("VALIDATION", parsed.error.message);
  }

  await assertProjectExists(slug);

  const { id, title, body } = parsed.data;

  if (await manualSectionExists(slug, id)) {
    throw new ManageSectionError(
      "SECTION_ALREADY_EXISTS",
      `Seção "${id}" já existe neste manual.`
    );
  }

  const content = body?.trim() ? body : `# ${title?.trim() || id}\n\nDescreva esta seção.\n`;

  await writeManualSection(slug, id, content);
  await afterWrite(slug);

  return { id, title: titleFromMarkdown(content, id), body: content };
}

/** Substitui o Markdown de uma seção existente (inline edit do editor). */
export async function updateManualSectionBody(
  slug: string,
  rawId: string,
  input: unknown
): Promise<ManualSection> {
  const id = parseSectionId(rawId);
  const parsed = updateManualSectionInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ManageSectionError("VALIDATION", parsed.error.message);
  }

  await assertProjectExists(slug);

  if (!(await manualSectionExists(slug, id))) {
    throw new ManageSectionError("SECTION_NOT_FOUND", `Seção "${id}" não encontrada.`);
  }

  await writeManualSection(slug, id, parsed.data.body);
  await afterWrite(slug);

  const section = await readManualSection(slug, id);
  if (!section) {
    throw new ManageSectionError("SECTION_NOT_FOUND", `Seção "${id}" não encontrada.`);
  }
  return section;
}

/** Remove a seção (apaga o arquivo `.md`). */
export async function removeManualSection(slug: string, rawId: string): Promise<void> {
  const id = parseSectionId(rawId);
  await assertProjectExists(slug);

  const deleted = await deleteManualSection(slug, id);
  if (!deleted) {
    throw new ManageSectionError("SECTION_NOT_FOUND", `Seção "${id}" não encontrada.`);
  }

  await afterWrite(slug);
}
