/**
 * Sincroniza o cofre Obsidian (`obsidian/`) a partir de `docs/` e `content/`.
 * Uso: npm run obsidian:sync
 */
import {
  lstat,
  mkdir,
  readdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import {
  integrationManualSchema,
  type IntegrationManual,
  type ManualOperation,
} from "../modules/living-docs-externa/schema/manual";
import { projectConfigSchema, type ProjectConfig } from "../modules/living-docs-externa/schema/project";

const ROOT = process.cwd();
const VAULT = path.join(ROOT, "obsidian");
const DOCS = path.join(ROOT, "docs");
const CONTENT = path.join(ROOT, "content", "projects");

async function pathExists(target: string): Promise<boolean> {
  try {
    await lstat(target);
    return true;
  } catch {
    return false;
  }
}

/** Junction (Windows) ou symlink de pasta — edits na origem aparecem no Obsidian. */
async function ensureDirLink(linkPath: string, targetPath: string): Promise<void> {
  const absTarget = path.resolve(targetPath);
  const absLink = path.resolve(linkPath);

  if (!(await pathExists(absTarget))) {
    return;
  }

  if (await pathExists(absLink)) {
    return;
  }

  await mkdir(path.dirname(absLink), { recursive: true });
  const linkType = process.platform === "win32" ? "junction" : "dir";
  await symlink(absTarget, absLink, linkType);
}

async function listProjectSlugs(): Promise<string[]> {
  if (!(await pathExists(CONTENT))) return [];
  const entries = await readdir(CONTENT, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

function wikiLink(name: string, alias?: string): string {
  if (alias && alias !== name) {
    return `[[${name}|${alias}]]`;
  }
  return `[[${name}]]`;
}

function escapeMd(text: string): string {
  return text.replace(/\|/g, "\\|");
}

function renderOperationNote(slug: string, operation: ManualOperation): string {
  const lines: string[] = [
    "---",
    "generated: true",
    `project: ${slug}`,
    `kind: ${operation.kind}`,
    `name: ${operation.name}`,
    `order: ${operation.order}`,
    "---",
    "",
    `# ${operation.title ?? operation.name}`,
    "",
    `**Operação:** \`${operation.kind}.${operation.name}\` · **Projeto:** [[produtos/${slug}/_index|${slug}]]`,
    "",
  ];

  if (operation.description) {
    lines.push(operation.description, "");
  }

  if (operation.authRequired !== undefined) {
    lines.push(`- **Auth no gateway:** ${operation.authRequired ? "sim" : "não"}`, "");
  }

  if (operation.prerequisites?.length) {
    lines.push("## Pré-requisitos", "");
    for (const prereq of operation.prerequisites) {
      lines.push(`- ${wikiLink(`produtos/${slug}/operations/${prereq}`, prereq)}`);
    }
    lines.push("");
  }

  if (operation.relatedSections?.length) {
    lines.push("## Seções relacionadas", "");
    for (const sectionId of operation.relatedSections) {
      lines.push(`- ${wikiLink(`produtos/${slug}/sections/${sectionId}`, sectionId)}`);
    }
    lines.push("");
  }

  if (operation.businessNotes?.length) {
    lines.push("## Notas de negócio", "");
    for (const note of operation.businessNotes) {
      lines.push(`- ${note}`);
    }
    lines.push("");
  }

  if (operation.exampleQuery) {
    lines.push("## Exemplo GraphQL", "", "```graphql", operation.exampleQuery.trim(), "```", "");
  }

  lines.push("---", `↩ [[produtos/${slug}/_index|Voltar ao manual ${slug}]]`, "");

  return lines.join("\n");
}

function renderProjectIndex(config: ProjectConfig, manual: IntegrationManual): string {
  const sortedOps = [...manual.operations].sort((a, b) => a.order - b.order);
  const lines: string[] = [
    "---",
    "generated: true",
    `slug: ${config.slug}`,
    `published: ${config.published}`,
    "---",
    "",
    `# ${manual.title}`,
    "",
    `| Campo | Valor |`,
    `| --- | --- |`,
    `| Slug | \`${config.slug}\` |`,
    `| Produto | ${escapeMd(manual.productName ?? "—")} |`,
    `| Versão manual | ${escapeMd(manual.manualVersion ?? "—")} |`,
    `| Ambiente | ${escapeMd(config.environment ?? "—")} |`,
    `| Publicado | ${config.published ? "sim" : "não"} |`,
    `| GraphQL | ${config.graphqlUrl ?? "—"} |`,
    "",
  ];

  if (config.description) {
    lines.push(config.description, "");
  }

  lines.push("## Roteiro (operações)", "");
  for (const op of sortedOps) {
    const label = op.title ?? `${op.kind}.${op.name}`;
    lines.push(
      `${op.order}. ${wikiLink(`produtos/${config.slug}/operations/${op.name}`, label)}`
    );
  }
  lines.push("");

  if (manual.referenceTables?.length) {
    lines.push("## Tabelas de referência", "");
    for (const table of manual.referenceTables) {
      lines.push(`### ${table.title}`, "");
      lines.push(`| ${table.columns.join(" | ")} |`);
      lines.push(`| ${table.columns.map(() => "---").join(" | ")} |`);
      for (const row of table.rows) {
        lines.push(`| ${row.map(escapeMd).join(" | ")} |`);
      }
      lines.push("");
    }
  }

  if (manual.versionHistory?.length) {
    lines.push("## Histórico de versão", "");
    for (const entry of manual.versionHistory) {
      lines.push(`- **${entry.version}** (${entry.date}) — ${entry.author}: ${entry.details}`);
    }
    lines.push("");
  }

  lines.push("## Seções (Markdown)", "");
  lines.push(
    `_Edite em \`content/projects/${config.slug}/sections/\` — atualiza aqui automaticamente._`,
    ""
  );
  lines.push(`↩ [[00-MAPA-PORTAL|Mapa do portal]]`, "");

  return lines.join("\n");
}

async function renderHub(slugs: string[]): Promise<string> {
  const lines: string[] = [
    "---",
    "generated: true",
    "---",
    "",
    "# Portal EDI — mapa central",
    "",
    "Cofre gerado a partir do repositório. Rode `npm run obsidian:watch` para manter atualizado.",
    "",
    "## Documentação do projeto",
    "",
    `- ${wikiLink("docs/estrutura/mapa-projeto", "Mapa do projeto")}`,
    `- ${wikiLink("docs/migracao/mapa-documentacao-funcional", "Mapa documentação funcional")}`,
    `- ${wikiLink("docs/migracao/cronograma", "Cronograma de migração")}`,
    `- ${wikiLink("docs/migracao/README", "Migração — índice")}`,
    `- ${wikiLink("docs/arquitetura/adr/README", "ADRs (decisões de arquitetura)")}`,
    "",
    "## Produtos / manuais",
    "",
  ];

  for (const slug of slugs) {
    lines.push(`- ${wikiLink(`produtos/${slug}/_index`, slug)}`);
  }

  lines.push(
    "",
    "## Estudos",
    "",
    `- ${wikiLink("00-PAINEL-ESTUDOS", "Painel de estudos (comandos, fluxos, cronograma)")}`,
    `- ${wikiLink("cronograma-estudos", "Cronograma de estudos")}`,
    `- ${wikiLink("glossario", "Glossário")}`,
    `- ${wikiLink("diario", "Diário de aprendizado")}`,
    "",
    "## Suas anotações",
    "",
    "Crie notas em `notas/` — essa pasta não é sobrescrita pelo sync.",
    "",
    "## Comandos",
    "",
    "| Comando | Para quê |",
    "| --- | --- |",
    "| `npm run obsidian:sync` | Atualiza o cofre uma vez |",
    "| `npm run obsidian:watch` | Fica observando `content/` e `docs/` |",
    ""
  );

  return lines.join("\n");
}

async function syncProject(slug: string): Promise<void> {
  const configPath = path.join(CONTENT, slug, "config.json");
  const manualPath = path.join(CONTENT, slug, "manual.json");
  const sectionsSource = path.join(CONTENT, slug, "sections");

  if (!(await pathExists(configPath)) || !(await pathExists(manualPath))) {
    return;
  }

  const config = projectConfigSchema.parse(
    JSON.parse(await readFile(configPath, "utf8"))
  );
  const manual = integrationManualSchema.parse(
    JSON.parse(await readFile(manualPath, "utf8"))
  );

  const projectDir = path.join(VAULT, "produtos", slug);
  const operationsDir = path.join(projectDir, "operations");
  const sectionsLink = path.join(projectDir, "sections");

  await mkdir(operationsDir, { recursive: true });
  await ensureDirLink(sectionsLink, sectionsSource);

  await writeFile(
    path.join(projectDir, "_index.md"),
    renderProjectIndex(config, manual),
    "utf8"
  );

  const existingOps = await readdir(operationsDir).catch(() => [] as string[]);
  const nextOps = new Set(manual.operations.map((op) => `${op.name}.md`));

  for (const file of existingOps) {
    if (file.endsWith(".md") && !nextOps.has(file)) {
      await rm(path.join(operationsDir, file));
    }
  }

  for (const operation of manual.operations) {
    await writeFile(
      path.join(operationsDir, `${operation.name}.md`),
      renderOperationNote(slug, operation),
      "utf8"
    );
  }
}

export async function syncObsidianVault(): Promise<void> {
  await mkdir(path.join(VAULT, "notas"), { recursive: true });
  await ensureDirLink(path.join(VAULT, "docs"), DOCS);

  const slugs = await listProjectSlugs();

  for (const slug of slugs) {
    await syncProject(slug);
  }

  await writeFile(path.join(VAULT, "00-MAPA-PORTAL.md"), await renderHub(slugs), "utf8");

  console.log(`Obsidian vault sincronizado em ${VAULT}`);
  console.log(`  Projetos: ${slugs.length ? slugs.join(", ") : "(nenhum)"}`);
}

if (process.argv[1]?.includes("sync-obsidian-vault")) {
  syncObsidianVault().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
