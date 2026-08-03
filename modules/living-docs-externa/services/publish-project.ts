/**
 * Alterna a publicação de um projeto (etapa 3.5). Publicar/despublicar é só
 * um flag em `config.json` — a visibilidade em si já é aplicada em
 * `services/get-published-manual.ts` e `list-published-manuals.ts`, que só
 * retornam projetos com `published: true`.
 *
 * Etapa 6.5: publicar passa pelo checklist de `services/manual-quality.ts`.
 * Despublicar nunca é bloqueado — tirar do ar é sempre permitido.
 */

import { revalidateTag } from "next/cache";

import { publishProjectInputSchema } from "@/modules/living-docs-externa/schema/project";
import { updateProjectPublishStatus } from "@/modules/living-docs-externa/repository/project-repository";
import { LIVING_DOCS_CACHE_TAGS } from "@/modules/living-docs-externa/services/cache-tags";
import {
  getManualQualityReport,
  type ManualQualityReport,
} from "@/modules/living-docs-externa/services/manual-quality";
import type { ProjectConfig } from "@/modules/living-docs-externa/schema/project";

export type PublishProjectErrorCode = "VALIDATION" | "PROJECT_NOT_FOUND" | "QUALITY_GATE";

export class PublishProjectError extends Error {
  constructor(
    public readonly code: PublishProjectErrorCode,
    message: string,
    /** Preenchido em QUALITY_GATE para o editor listar as pendências. */
    public readonly report?: ManualQualityReport
  ) {
    super(message);
    this.name = "PublishProjectError";
  }
}

function qualityGateMessage(report: ManualQualityReport): string {
  const failing = report.checks
    .filter((check) => check.status === "fail")
    .map((check) => check.label)
    .join("; ");
  return `Checklist de qualidade não atendido: ${failing}.`;
}

export async function setProjectPublished(slug: string, input: unknown): Promise<ProjectConfig> {
  const parsed = publishProjectInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new PublishProjectError("VALIDATION", parsed.error.message);
  }

  if (parsed.data.published) {
    const report = await getManualQualityReport(slug);
    if (!report) {
      throw new PublishProjectError("PROJECT_NOT_FOUND", `Projeto "${slug}" não encontrado.`);
    }
    if (!report.readyToPublish) {
      throw new PublishProjectError("QUALITY_GATE", qualityGateMessage(report), report);
    }
  }

  let config: ProjectConfig;
  try {
    config = await updateProjectPublishStatus(slug, parsed.data.published);
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
      throw new PublishProjectError("PROJECT_NOT_FOUND", `Projeto "${slug}" não encontrado.`);
    }
    throw error;
  }

  revalidateTag(LIVING_DOCS_CACHE_TAGS.projects);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.project(slug));

  return config;
}
