/**
 * CRUD de operações do manual (`manual.json`) de um projeto — etapa 3.4.
 *
 * Cada operação é identificada pelo par (`kind`, `name`), único dentro do
 * manual. Toda escrita passa pelo schema Zod (`schema/manual.ts`), persiste
 * via `repository/project-repository.ts` e revalida os caches de listagem e
 * leitura publicada (`services/cache-tags.ts`).
 */

import { revalidateTag } from "next/cache";

import {
  createManualOperationInputSchema,
  updateManualOperationInputSchema,
  type IntegrationManual,
  type ManualOperation,
  type ManualOperationKind,
} from "@/modules/living-docs-externa/schema/manual";
import {
  getManual,
  updateProjectConfigUpdatedAt,
  writeManual,
} from "@/modules/living-docs-externa/repository/project-repository";
import { LIVING_DOCS_CACHE_TAGS } from "@/modules/living-docs-externa/services/cache-tags";

export type ManageOperationErrorCode =
  | "VALIDATION"
  | "PROJECT_NOT_FOUND"
  | "OPERATION_NOT_FOUND"
  | "OPERATION_ALREADY_EXISTS";

export class ManageOperationError extends Error {
  constructor(
    public readonly code: ManageOperationErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ManageOperationError";
  }
}

function findOperationIndex(
  manual: IntegrationManual,
  kind: ManualOperationKind,
  name: string
): number {
  return manual.operations.findIndex((op) => op.kind === kind && op.name === name);
}

function nextOrder(manual: IntegrationManual): number {
  return manual.operations.reduce((max, op) => Math.max(max, op.order), 0) + 1;
}

async function loadManualOrThrow(slug: string): Promise<IntegrationManual> {
  const manual = await getManual(slug);
  if (!manual) {
    throw new ManageOperationError("PROJECT_NOT_FOUND", `Projeto "${slug}" não encontrado.`);
  }
  return manual;
}

async function persistManual(slug: string, manual: IntegrationManual): Promise<void> {
  await writeManual(slug, manual);
  await updateProjectConfigUpdatedAt(slug);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.projects);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.project(slug));
}

/** Adiciona uma operação nova ao manual. `order` é auto-atribuído se omitido. */
export async function addManualOperation(slug: string, input: unknown): Promise<ManualOperation> {
  const parsed = createManualOperationInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ManageOperationError("VALIDATION", parsed.error.message);
  }

  const manual = await loadManualOrThrow(slug);

  if (findOperationIndex(manual, parsed.data.kind, parsed.data.name) !== -1) {
    throw new ManageOperationError(
      "OPERATION_ALREADY_EXISTS",
      `Operação "${parsed.data.kind}:${parsed.data.name}" já existe neste manual.`
    );
  }

  const operation: ManualOperation = {
    ...parsed.data,
    order: parsed.data.order ?? nextOrder(manual),
  };

  await persistManual(slug, { ...manual, operations: [...manual.operations, operation] });
  return operation;
}

/** Substitui os campos editáveis de uma operação existente (identidade fixa por kind+name). */
export async function updateManualOperation(
  slug: string,
  kind: ManualOperationKind,
  name: string,
  input: unknown
): Promise<ManualOperation> {
  const parsed = updateManualOperationInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ManageOperationError("VALIDATION", parsed.error.message);
  }

  const manual = await loadManualOrThrow(slug);
  const index = findOperationIndex(manual, kind, name);
  if (index === -1) {
    throw new ManageOperationError(
      "OPERATION_NOT_FOUND",
      `Operação "${kind}:${name}" não encontrada.`
    );
  }

  const updatedOperation: ManualOperation = { ...parsed.data, kind, name };
  const operations = [...manual.operations];
  operations[index] = updatedOperation;

  await persistManual(slug, { ...manual, operations });
  return updatedOperation;
}

export interface BulkAddManualOperationsResult {
  added: ManualOperation[];
  skipped: Array<{
    kind?: ManualOperationKind;
    name?: string;
    reason: "ALREADY_EXISTS" | "VALIDATION";
  }>;
}

/**
 * Adiciona várias operações de uma vez (fluxo "aceitar sugestões do schema").
 * Lê e grava o manual uma única vez — evita N escritas/N revalidações para um
 * lote típico de 10-40 operações descobertas na sincronização.
 *
 * Entradas inválidas ou já existentes são reportadas em `skipped` em vez de
 * abortar o lote inteiro: o operador pode ter desmarcado só parte, o resto
 * deve entrar.
 */
export async function addManualOperationsBulk(
  slug: string,
  inputs: unknown[]
): Promise<BulkAddManualOperationsResult> {
  const manual = await loadManualOrThrow(slug);
  const operations = [...manual.operations];
  const added: ManualOperation[] = [];
  const skipped: BulkAddManualOperationsResult["skipped"] = [];
  let cursor = nextOrder(manual);

  for (const raw of inputs) {
    const parsed = createManualOperationInputSchema.safeParse(raw);
    if (!parsed.success) {
      const partial = raw as { kind?: ManualOperationKind; name?: string };
      skipped.push({ kind: partial?.kind, name: partial?.name, reason: "VALIDATION" });
      continue;
    }

    if (operations.some((op) => op.kind === parsed.data.kind && op.name === parsed.data.name)) {
      skipped.push({ kind: parsed.data.kind, name: parsed.data.name, reason: "ALREADY_EXISTS" });
      continue;
    }

    const operation: ManualOperation = {
      ...parsed.data,
      order: parsed.data.order ?? cursor++,
    };
    operations.push(operation);
    added.push(operation);
  }

  if (added.length > 0) {
    await persistManual(slug, { ...manual, operations });
  }

  return { added, skipped };
}

/** Remove uma operação do manual. */
export async function removeManualOperation(
  slug: string,
  kind: ManualOperationKind,
  name: string
): Promise<void> {
  const manual = await loadManualOrThrow(slug);
  const index = findOperationIndex(manual, kind, name);
  if (index === -1) {
    throw new ManageOperationError(
      "OPERATION_NOT_FOUND",
      `Operação "${kind}:${name}" não encontrada.`
    );
  }

  const operations = manual.operations.filter((_, i) => i !== index);
  await persistManual(slug, { ...manual, operations });
}
