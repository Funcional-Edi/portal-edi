import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { integrationManualSchema } from "@/modules/living-docs-externa/schema/manual";
import { projectConfigSchema } from "@/modules/living-docs-externa/schema/project";

const PROJECTS_ROOT = path.join(process.cwd(), "content", "projects");
const SEED_ONLY_PROJECTS = new Set(["canal-autorizador", "edi-canais"]);

async function readJson(filePath: string): Promise<unknown> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function validateProject(slug: string): Promise<string[]> {
  const errors: string[] = [];
  const baseDir = path.join(PROJECTS_ROOT, slug);
  const configPath = path.join(baseDir, "config.json");
  const manualPath = path.join(baseDir, "manual.json");

  let config;
  let manual;
  try {
    config = projectConfigSchema.parse(await readJson(configPath));
  } catch (error) {
    errors.push(`${slug}: config inválido (${String(error)})`);
    return errors;
  }

  try {
    manual = integrationManualSchema.parse(await readJson(manualPath));
  } catch (error) {
    errors.push(`${slug}: manual inválido (${String(error)})`);
    return errors;
  }

  if (!config.published) return errors;

  if (!config.graphqlUrl) {
    errors.push(`${slug}: projeto publicado sem graphqlUrl em config.json.`);
  }
  if (manual.operations.length === 0) {
    errors.push(`${slug}: projeto publicado sem operações em manual.json.`);
  }

  return errors;
}

async function main() {
  const entries = await readdir(PROJECTS_ROOT, { withFileTypes: true });
  const slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

  const allErrors: string[] = [];
  const seedOnlyPresent: string[] = [];
  for (const slug of slugs) {
    if (SEED_ONLY_PROJECTS.has(slug)) {
      seedOnlyPresent.push(slug);
    }
    const errors = await validateProject(slug);
    allErrors.push(...errors);
  }

  if (seedOnlyPresent.length > 0) {
    console.log(
      `[validate-published-projects] Seeds apenas de desenvolvimento: ${seedOnlyPresent.join(", ")}`
    );
  }

  if (allErrors.length > 0) {
    console.error("[validate-published-projects] Falhas encontradas:");
    for (const error of allErrors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `[validate-published-projects] OK: ${slugs.length} projeto(s) validados, publicados com graphqlUrl e operações.`
  );
}

main().catch((error) => {
  console.error("[validate-published-projects] Erro inesperado:", error);
  process.exitCode = 1;
});
