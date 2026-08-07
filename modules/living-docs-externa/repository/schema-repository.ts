import { projectSchemaPath } from "@/core/db/adapters/content-paths";
import { readContentJson, writeContentJson } from "@/core/db/adapters";
import {
  projectSchemaSnapshotSchema,
  type ProjectSchemaSnapshot,
} from "@/modules/living-docs-externa/schema/introspection";

export async function readProjectSchemaSnapshot(
  slug: string
): Promise<ProjectSchemaSnapshot | null> {
  const raw = await readContentJson<unknown>(projectSchemaPath(slug));
  if (!raw) return null;

  const parsed = projectSchemaSnapshotSchema.safeParse(raw);
  if (!parsed.success) return null;
  return parsed.data;
}

export async function writeProjectSchemaSnapshot(
  slug: string,
  snapshot: ProjectSchemaSnapshot
): Promise<void> {
  await writeContentJson(projectSchemaPath(slug), snapshot);
}
