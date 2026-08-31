import { sortOperations, type IntegrationManual } from "@/modules/living-docs-externa/schema/manual";
import type { ProjectConfig } from "@/modules/living-docs-externa/schema/project";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_MARGIN_X = 42;
const PAGE_MARGIN_TOP = 800;
const LINE_HEIGHT = 14;
const MAX_LINES_PER_PAGE = 50;
const MAX_CHARS_PER_LINE = 95;

function normalizeInline(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapLine(line: string, maxChars = MAX_CHARS_PER_LINE): string[] {
  const normalized = normalizeInline(line);
  if (!normalized) return [""];
  if (normalized.length <= maxChars) return [normalized];

  const words = normalized.split(" ");
  const wrapped: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) wrapped.push(current);
    current = word;
  }

  if (current) wrapped.push(current);
  return wrapped;
}

function buildPdfLines(config: ProjectConfig, manual: IntegrationManual): string[] {
  const lines: string[] = [];
  const operations = sortOperations(manual);

  const isRest = config.protocol === "rest";

  lines.push(`Manual de Integracao - ${manual.title}`);
  lines.push(`Projeto: ${config.name} (${config.slug})`);
  lines.push(`Protocolo: ${isRest ? "REST" : "GraphQL"}`);
  lines.push(`Ambiente: ${config.environment ?? "nao informado"}`);
  lines.push(`Publicado: ${config.published ? "sim" : "nao"}`);
  lines.push(
    isRest
      ? `URL base da API: ${config.apiBaseUrl ?? "nao configurada"}`
      : `URL GraphQL: ${config.graphqlUrl ?? "nao configurada"}`
  );
  lines.push("");

  if (config.description) {
    lines.push("Descricao:");
    lines.push(...wrapLine(config.description));
    lines.push("");
  }

  lines.push(`Operacoes documentadas (${operations.length}):`);
  lines.push("");

  for (const operation of operations) {
    const kindLabel = operation.kind === "rest" ? operation.method ?? "REST" : operation.kind;
    lines.push(
      ...wrapLine(
        `${operation.order}. [${kindLabel}] ${operation.title ?? operation.name} (${operation.name})`
      )
    );
    if (operation.description) {
      lines.push(...wrapLine(`Descricao: ${operation.description}`));
    }
    if (operation.kind === "rest") {
      if (operation.path) {
        lines.push(...wrapLine(`Endpoint: ${operation.method ?? ""} ${operation.path}`));
      }
      if (operation.exampleBody) {
        const preview = normalizeInline(operation.exampleBody).slice(0, 180);
        lines.push(...wrapLine(`Corpo: ${preview}${preview.length === 180 ? "..." : ""}`));
      }
    } else if (operation.exampleQuery) {
      const preview = normalizeInline(operation.exampleQuery).slice(0, 180);
      lines.push(...wrapLine(`Exemplo: ${preview}${preview.length === 180 ? "..." : ""}`));
    }
    lines.push("");
  }

  return lines;
}

function paginate(lines: string[]): string[][] {
  if (lines.length === 0) return [[""]];
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += MAX_LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + MAX_LINES_PER_PAGE));
  }
  return pages;
}

function buildPageContent(lines: string[]): string {
  const commands: string[] = [`BT /F1 10 Tf ${PAGE_MARGIN_X} ${PAGE_MARGIN_TOP} Td`];
  for (const line of lines) {
    commands.push(`(${escapePdfText(line)}) Tj`);
    commands.push(`0 -${LINE_HEIGHT} Td`);
  }
  commands.push("ET");
  return commands.join("\n");
}

/** Exporta um PDF leve (sem dependência externa) com resumo do manual curado. */
export function buildManualPdf(config: ProjectConfig, manual: IntegrationManual): Buffer {
  const pages = paginate(buildPdfLines(config, manual));
  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Count __COUNT__ /Kids [__KIDS__] >>");

  const pageObjectIndexes: number[] = [];
  const contentObjectIndexes: number[] = [];

  for (const pageLines of pages) {
    const content = buildPageContent(pageLines);
    const contentObj = `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`;
    objects.push(contentObj);
    const contentObjectId = objects.length;
    contentObjectIndexes.push(contentObjectId);

    const pageObj =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 __FONT_ID__ 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects.push(pageObj);
    pageObjectIndexes.push(objects.length);
  }

  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontObjectId = objects.length;

  objects[1] = objects[1]
    .replace("__COUNT__", String(pageObjectIndexes.length))
    .replace("__KIDS__", pageObjectIndexes.map((id) => `${id} 0 R`).join(" "));

  for (let i = 0; i < objects.length; i += 1) {
    objects[i] = objects[i].replace("__FONT_ID__", String(fontObjectId));
  }

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

export function pdfDownloadFilename(slug: string): string {
  return `${slug}-manual.pdf`;
}
