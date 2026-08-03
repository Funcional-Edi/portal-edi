import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { integrationManualSchema } from "../modules/living-docs-externa/schema/manual";
import { projectConfigSchema } from "../modules/living-docs-externa/schema/project";

interface CliOptions {
  legacyRoot: string;
  targetRoot: string;
  projects: string[];
}

function parseCli(): CliOptions {
  const args = process.argv.slice(2);
  const map = new Map<string, string>();

  for (let i = 0; i < args.length; i += 1) {
    const current = args[i];
    if (!current.startsWith("--")) continue;
    const value = args[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Valor ausente para argumento ${current}.`);
    }
    map.set(current, value);
    i += 1;
  }

  const legacyRoot = map.get("--legacy-root");
  if (!legacyRoot) {
    throw new Error(
      "Informe --legacy-root com a raiz do projeto legado (onde existe content/projects)."
    );
  }

  const targetRoot = map.get("--target-root") ?? process.cwd();
  const projectsRaw = map.get("--projects") ?? "im,wholesaler";
  const projects = projectsRaw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (projects.length === 0) {
    throw new Error("Nenhum projeto informado em --projects.");
  }

  return { legacyRoot, targetRoot, projects };
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function copyProject(options: CliOptions, slug: string): Promise<void> {
  const sourceProjectDir = path.join(options.legacyRoot, "content", "projects", slug);
  const targetProjectDir = path.join(options.targetRoot, "content", "projects", slug);

  const sourceConfigPath = path.join(sourceProjectDir, "config.json");
  const sourceManualPath = path.join(sourceProjectDir, "manual.json");
  const sourceSectionsDir = path.join(sourceProjectDir, "sections");
  const sourceAssetsDir = path.join(sourceProjectDir, "assets");

  const [configRaw, manualRaw] = await Promise.all([
    readJsonFile(sourceConfigPath),
    readJsonFile(sourceManualPath),
  ]);

  const config = projectConfigSchema.parse(configRaw);
  const manual = integrationManualSchema.parse(manualRaw);

  await mkdir(targetProjectDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(targetProjectDir, "config.json"), `${JSON.stringify(config, null, 2)}\n`),
    writeFile(path.join(targetProjectDir, "manual.json"), `${JSON.stringify(manual, null, 2)}\n`),
    cp(sourceSectionsDir, path.join(targetProjectDir, "sections"), {
      recursive: true,
      force: true,
    }),
    cp(sourceAssetsDir, path.join(targetProjectDir, "assets"), {
      recursive: true,
      force: true,
    }).catch(() => undefined),
  ]);
}

async function main() {
  const options = parseCli();
  const migrated: string[] = [];

  for (const slug of options.projects) {
    await copyProject(options, slug);
    migrated.push(slug);
    console.log(`[migrate-content] projeto migrado: ${slug}`);
  }

  console.log(
    `[migrate-content] concluido. ${migrated.length} projeto(s) em content/projects: ${migrated.join(
      ", "
    )}`
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[migrate-content] erro: ${message}`);
  process.exit(1);
});
