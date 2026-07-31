import { projectSectionsDir } from "@/core/db/adapters/content-paths";
import {
  listContentFiles,
  readContentText,
} from "@/core/db/adapters";
import {
  sectionIdSchema,
  titleFromMarkdown,
  type ManualSection,
} from "@/modules/living-docs-externa/schema/section";

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
