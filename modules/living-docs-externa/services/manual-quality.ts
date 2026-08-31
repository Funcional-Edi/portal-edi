/**
 * Checklist de qualidade do manual — etapa 6.5.
 *
 * Antes de publicar, o manual passa por regras objetivas: sem elas o
 * distribuidor recebe um roteiro incompleto (operação sem descrição, seção
 * vazia, `relatedSections` apontando para arquivo que não existe).
 *
 * `evaluateManualQuality` é pura (só recebe dados) para ser testável sem I/O;
 * `getManualQualityReport` é o wrapper que lê do CMS.
 *
 * Severidade:
 * - `fail`  → bloqueia publicação (`readyToPublish: false`)
 * - `warn`  → não bloqueia, aparece como pendência no editor
 * - `pass`  → ok
 */

import type { IntegrationManual, ProjectConfig } from "@/modules/living-docs-externa/schema";
import { getProject } from "@/modules/living-docs-externa/repository/project-repository";
import { listManualSections } from "@/modules/living-docs-externa/repository/section-repository";
import type { ManualSection } from "@/modules/living-docs-externa/schema/section";

export type ManualQualityStatus = "pass" | "warn" | "fail";

export interface ManualQualityCheck {
  id: string;
  label: string;
  status: ManualQualityStatus;
  /** Explicação do que falta, exibida no editor. */
  detail?: string;
}

export interface ManualQualityReport {
  slug: string;
  checks: ManualQualityCheck[];
  failed: number;
  warnings: number;
  /** false quando existe pelo menos um check `fail`. */
  readyToPublish: boolean;
}

export interface ManualQualityInput {
  config: ProjectConfig;
  manual: IntegrationManual;
  sections: ManualSection[];
}

/** Abaixo disso a seção é um placeholder, não conteúdo útil para o distribuidor. */
const MIN_SECTION_BODY_LENGTH = 80;

function operationKey(operation: { kind: string; name: string }): string {
  return `${operation.kind}:${operation.name}`;
}

/** Título gerado por `createProject` — publicar com ele é esquecimento, não escolha. */
function isPlaceholderTitle(title: string, projectName: string): boolean {
  return title.trim() === `Manual de integração — ${projectName}`;
}

function check(
  id: string,
  label: string,
  ok: boolean,
  severity: Exclude<ManualQualityStatus, "pass">,
  detail: string
): ManualQualityCheck {
  return ok ? { id, label, status: "pass" } : { id, label, status: severity, detail };
}

export function evaluateManualQuality({
  config,
  manual,
  sections,
}: ManualQualityInput): ManualQualityReport {
  const sectionIds = new Set(sections.map((section) => section.id));

  const emptySections = sections.filter(
    (section) =>
      section.body.trim().length < MIN_SECTION_BODY_LENGTH || !/^#\s+.+$/m.test(section.body)
  );

  const operationsWithoutDescription = manual.operations.filter(
    (operation) => !operation.description?.trim()
  );

  const operationsWithoutExample = manual.operations.filter((operation) =>
    operation.kind === "rest"
      ? !(operation.method && operation.path?.trim())
      : !operation.exampleQuery?.trim()
  );

  const orders = manual.operations.map((operation) => operation.order);
  const duplicatedOrders = [...new Set(orders.filter((o, i) => orders.indexOf(o) !== i))];

  const brokenReferences = manual.operations.flatMap((operation) =>
    (operation.relatedSections ?? [])
      .filter((sectionId) => !sectionIds.has(sectionId))
      .map((sectionId) => `${operationKey(operation)} → ${sectionId}`)
  );

  const checks: ManualQualityCheck[] = [
    check(
      "titulo",
      "Manual tem título próprio",
      manual.title.trim().length > 0 && !isPlaceholderTitle(manual.title, config.name),
      "fail",
      "O título ainda é o gerado automaticamente na criação do projeto."
    ),
    check(
      "produto",
      "Produto informado",
      Boolean(manual.productName?.trim()),
      "warn",
      "Sem `productName` o distribuidor não vê a qual produto o manual pertence."
    ),
    check(
      "contexto",
      "Pelo menos uma seção de contexto",
      sections.length > 0,
      "fail",
      "Nenhuma seção em `sections/*.md`: o manual abre direto no roteiro, sem contexto."
    ),
    check(
      "secoes-com-conteudo",
      "Seções preenchidas",
      emptySections.length === 0,
      "fail",
      `Seções sem título \`#\` ou com menos de ${MIN_SECTION_BODY_LENGTH} caracteres: ${emptySections
        .map((section) => section.id)
        .join(", ")}.`
    ),
    check(
      "operacoes",
      "Pelo menos uma operação no roteiro",
      manual.operations.length > 0,
      "fail",
      "O roteiro de integração está vazio."
    ),
    check(
      "operacoes-descritas",
      "Todas as operações têm descrição",
      operationsWithoutDescription.length === 0,
      "fail",
      `Sem descrição: ${operationsWithoutDescription.map(operationKey).join(", ")}.`
    ),
    check(
      "operacoes-exemplo",
      "Todas as operações têm exemplo (GraphQL ou endpoint REST)",
      operationsWithoutExample.length === 0,
      "warn",
      `Sem exemplo: ${operationsWithoutExample.map(operationKey).join(", ")}.`
    ),
    check(
      "ordem-unica",
      "Ordem das operações sem duplicidade",
      duplicatedOrders.length === 0,
      "fail",
      `Ordem repetida: ${duplicatedOrders.join(", ")}.`
    ),
    check(
      "secoes-relacionadas",
      "`relatedSections` apontam para seções existentes",
      brokenReferences.length === 0,
      "fail",
      `Referências quebradas: ${brokenReferences.join("; ")}.`
    ),
    check(
      "gateway",
      config.protocol === "rest" ? "API REST conectada" : "Gateway GraphQL conectado",
      config.protocol === "rest"
        ? Boolean(config.apiBaseUrl?.trim())
        : Boolean(config.graphqlUrl?.trim()),
      "warn",
      config.protocol === "rest"
        ? "Sem `apiBaseUrl` a exportação (Postman/Insomnia) fica incompleta para o distribuidor."
        : "Sem `graphqlUrl` o playground fica indisponível para o distribuidor."
    ),
  ];

  const failed = checks.filter((item) => item.status === "fail").length;
  const warnings = checks.filter((item) => item.status === "warn").length;

  return {
    slug: config.slug,
    checks,
    failed,
    warnings,
    readyToPublish: failed === 0,
  };
}

/** Lê projeto + seções do CMS e aplica o checklist. Null se o projeto não existir. */
export async function getManualQualityReport(
  slug: string
): Promise<ManualQualityReport | null> {
  const project = await getProject(slug);
  if (!project) return null;

  const sections = await listManualSections(slug);
  return evaluateManualQuality({
    config: project.config,
    manual: project.manual,
    sections,
  });
}
