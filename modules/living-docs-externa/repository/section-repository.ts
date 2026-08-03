import { projectSectionsDir } from "@/core/db/adapters/content-paths";
import {
  deleteContentFile,
  listContentFiles,
  readContentText,
  writeContentText,
} from "@/core/db/adapters";
import {
  sectionIdSchema,
  titleFromMarkdown,
  type ManualSection,
} from "@/modules/living-docs-externa/schema/section";

function sectionPath(slug: string, id: string): string {
  return `${projectSectionsDir(slug)}/${id}.md`;
}

/**
 * Lê `content/projects/{slug}/sections/*.md`.
 * Só I/O + parse mínimo — sem regra de negócio (arquitetura Portal-Edi).
 */
export async function listManualSections(slug: string): Promise<ManualSection[]> {
  const dir = projectSectionsDir(slug);
  const files = await listContentFiles(dir);
  const mdFiles = files.filter((name) => name.endsWith(".md")).sort();

  const sections: ManualSection[] = [];

  for (const fileName of mdFiles) {
    const idResult = sectionIdSchema.safeParse(fileName.replace(/\.md$/, ""));
    if (!idResult.success) continue;

    const body = await readContentText(`${dir}/${fileName}`);
    if (body === null) continue;

    sections.push({
      id: idResult.data,
      title: titleFromMarkdown(body, idResult.data),
      body,
    });
  }

  return sections;
}

/** Lê uma seção específica. Retorna null se o arquivo não existir. */
export async function readManualSection(
  slug: string,
  id: string
): Promise<ManualSection | null> {
  const body = await readContentText(sectionPath(slug, id));
  if (body === null) return null;
  return { id, title: titleFromMarkdown(body, id), body };
}

export async function manualSectionExists(slug: string, id: string): Promise<boolean> {
  return (await readContentText(sectionPath(slug, id))) !== null;
}

/**
 * Grava (cria ou sobrescreve) `sections/{id}.md`.
 * Validação do id/corpo fica em `services/manage-manual-sections.ts`.
 */
export async function writeManualSection(
  slug: string,
  id: string,
  body: string
): Promise<void> {
  await writeContentText(sectionPath(slug, id), body);
}

/** Remove `sections/{id}.md`. Retorna false se o arquivo não existia. */
export async function deleteManualSection(slug: string, id: string): Promise<boolean> {
  return deleteContentFile(sectionPath(slug, id));
}
