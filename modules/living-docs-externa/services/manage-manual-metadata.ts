/**
 * Cabeçalho do manual (título, produto, versão) — etapa 6.2.
 *
 * Existe porque o checklist de qualidade exige título próprio: sem editar o
 * cabeçalho na mesma tela, um projeto novo nunca sairia do rascunho. As
 * operações continuam em `manage-manual-operations.ts`.
 */

import { revalidateTag } from "next/cache";

import {
  updateManualMetadataInputSchema,
  type IntegrationManual,
} from "@/modules/living-docs-externa/schema/manual";
import {
  getManual,
  updateProjectConfigUpdatedAt,
  writeManual,
} from "@/modules/living-docs-externa/repository/project-repository";
import { LIVING_DOCS_CACHE_TAGS } from "@/modules/living-docs-externa/services/cache-tags";

export type ManageMetadataErrorCode = "VALIDATION" | "PROJECT_NOT_FOUND";

export class ManageMetadataError extends Error {
  constructor(
    public readonly code: ManageMetadataErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ManageMetadataError";
  }
}

export async function updateManualMetadata(
  slug: string,
  input: unknown
): Promise<IntegrationManual> {
  const parsed = updateManualMetadataInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ManageMetadataError("VALIDATION", parsed.error.message);
  }

  const manual = await getManual(slug);
  if (!manual) {
    throw new ManageMetadataError("PROJECT_NOT_FOUND", `Projeto "${slug}" não encontrado.`);
  }

  const updated: IntegrationManual = {
    ...manual,
    title: parsed.data.title,
    productName: parsed.data.productName,
    manualVersion: parsed.data.manualVersion,
  };

  await writeManual(slug, updated);
  await updateProjectConfigUpdatedAt(slug);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.projects);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.project(slug));

  return updated;
}
