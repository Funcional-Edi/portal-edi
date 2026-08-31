/**
 * Allowlist do playground GraphQL (Fase 4.1).
 *
 * Antes de qualquer query do playground chegar ao gateway do produto, ela
 * precisa ser validada contra as operações curadas em `manual.json`
 * (`operations[].kind` + `operations[].name`). Isso impede que um
 * distribuidor logado use o playground como um cliente GraphQL genérico
 * contra o gateway real — só o que o time documentou é executável.
 *
 * Função pura (sem I/O, sem rede): recebe o `IntegrationManual` já
 * carregado e o texto da query. Fácil de testar e de auditar.
 */

import { Kind, parse, type FieldNode, type OperationDefinitionNode } from "graphql";

import {
  findOperation,
  type IntegrationManual,
} from "@/modules/living-docs-externa/schema/manual";
import type { PlaygroundOperationKind } from "@/core/metrics/playground-metrics-store";

export type PlaygroundAllowlistErrorCode =
  | "INVALID_QUERY"
  | "SUBSCRIPTION_NOT_ALLOWED"
  | "INTROSPECTION_NOT_ALLOWED"
  | "MULTIPLE_OPERATIONS_NOT_SUPPORTED"
  | "OPERATION_NOT_ALLOWLISTED";

export class PlaygroundAllowlistError extends Error {
  constructor(
    public readonly code: PlaygroundAllowlistErrorCode,
    message: string
  ) {
    super(message);
    this.name = "PlaygroundAllowlistError";
  }
}

export interface PlaygroundAllowlistResult {
  kind: PlaygroundOperationKind;
  operationNames: string[];
}

function parseDocument(rawQuery: string) {
  try {
    return parse(rawQuery);
  } catch {
    throw new PlaygroundAllowlistError("INVALID_QUERY", "Query GraphQL inválida (erro de sintaxe).");
  }
}

/** Nomes dos campos selecionados na raiz da operação (MVP: sem fragments). */
function rootFieldNames(operation: OperationDefinitionNode): string[] {
  return operation.selectionSet.selections
    .filter((selection): selection is FieldNode => selection.kind === Kind.FIELD)
    .map((field) => field.name.value);
}

/**
 * Valida `rawQuery` contra o manual do projeto. Retorna o `kind` e os nomes
 * de operação (campos raiz) validados, ou lança `PlaygroundAllowlistError`.
 */
export function validatePlaygroundQuery(
  manual: IntegrationManual,
  rawQuery: string
): PlaygroundAllowlistResult {
  const document = parseDocument(rawQuery);

  const operations = document.definitions.filter(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === Kind.OPERATION_DEFINITION
  );

  if (operations.length === 0) {
    throw new PlaygroundAllowlistError("INVALID_QUERY", "Nenhuma operação encontrada na query.");
  }
  if (operations.length > 1) {
    throw new PlaygroundAllowlistError(
      "MULTIPLE_OPERATIONS_NOT_SUPPORTED",
      "O playground executa apenas uma operação por vez."
    );
  }

  const [operation] = operations;

  if (operation.operation === "subscription") {
    throw new PlaygroundAllowlistError(
      "SUBSCRIPTION_NOT_ALLOWED",
      "Subscriptions não são permitidas no playground."
    );
  }

  const kind: PlaygroundOperationKind = operation.operation === "mutation" ? "mutation" : "query";
  const names = rootFieldNames(operation);

  if (names.length === 0) {
    throw new PlaygroundAllowlistError("INVALID_QUERY", "A operação não seleciona nenhum campo.");
  }

  if (names.some((name) => name.startsWith("__"))) {
    throw new PlaygroundAllowlistError(
      "INTROSPECTION_NOT_ALLOWED",
      "Introspection não é permitida no playground."
    );
  }

  const notAllowlisted = names.find((name) => !findOperation(manual, kind, name));
  if (notAllowlisted) {
    throw new PlaygroundAllowlistError(
      "OPERATION_NOT_ALLOWLISTED",
      `Operação "${kind} ${notAllowlisted}" não está na allowlist deste manual.`
    );
  }

  return { kind, operationNames: names };
}
