/**
 * Sugestão determinística de operações a partir do schema GraphQL sincronizado
 * (`data/projects/<slug>/schema.json`) — etapa "revisar sugestões" do fluxo de
 * criação de projeto.
 *
 * Sem IA: usa só o que o introspection já entrega (nome do campo, argumentos,
 * tipos de entrada/saída — via `buildSchemaReferenceView`/`buildOperationSchemaDetail`,
 * as mesmas funções que alimentam a referência GraphQL em `/docs/api/[slug]`)
 * para montar um `title` legível e um `exampleQuery` de rascunho. O operador
 * decide quais sugestões viram operação de verdade no manual (`addManualOperationsBulk`)
 * e pode editar tudo depois pelo `OperationForm` normal.
 */

import { getManual } from "@/modules/living-docs-externa/repository/project-repository";
import { readProjectSchemaSnapshot } from "@/modules/living-docs-externa/repository/schema-repository";
import type { CreateManualOperationInput } from "@/modules/living-docs-externa/schema/manual";
import {
  buildOperationSchemaDetail,
  buildSchemaReferenceView,
  type OperationSchemaDetail,
  type SchemaFieldRow,
  type SchemaInputTypeSection,
} from "@/modules/living-docs-externa/services/schema-reference";

export interface SuggestedOperation {
  kind: "query" | "mutation";
  name: string;
  /** Já existe no `manual.json` deste projeto — sugestão aparece marcada/travada. */
  alreadyAdded: boolean;
  /** Doc string do campo no schema GraphQL, quando o time preencheu `description`. */
  schemaDescription?: string;
  /** Pronto para `POST /operations` ou `/operations/bulk` (o operador ainda cura). */
  draft: CreateManualOperationInput;
}

export interface SuggestOperationsResult {
  /** false = projeto ainda não sincronizou schema; UI deve orientar a sincronizar antes. */
  hasSchema: boolean;
  suggestions: SuggestedOperation[];
}

/** camelCase/PascalCase/snake_case → "Titulo Legivel" — só um ponto de partida. */
function humanizeFieldName(name: string): string {
  const spaced = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function isListType(formatted: string): boolean {
  return formatted.includes("[");
}

/** Placeholder de exemplo por tipo escalar GraphQL. Tipos desconhecidos (enum/objeto) viram `null`. */
function scalarPlaceholder(namedType: string | null): string {
  switch (namedType) {
    case "Int":
    case "Float":
      return "0";
    case "Boolean":
      return "false";
    case "String":
    case "ID":
      return '""';
    default:
      return "null";
  }
}

function inputObjectLiteral(inputType: SchemaInputTypeSection): string {
  const fields = inputType.fields
    .map((field) => `${field.name}: ${scalarPlaceholder(field.type.namedType)}`)
    .join(", ");
  return `{ ${fields} }`;
}

function argPlaceholder(
  row: SchemaFieldRow,
  inputTypesByName: Map<string, SchemaInputTypeSection>
): string {
  const inputType = row.type.namedType ? inputTypesByName.get(row.type.namedType) : undefined;
  if (!inputType) return scalarPlaceholder(row.type.namedType);

  const literal = inputObjectLiteral(inputType);
  return isListType(row.type.formatted) ? `[${literal}]` : literal;
}

/**
 * Monta um rascunho de query/mutation GraphQL a partir do detalhe de schema
 * (`buildOperationSchemaDetail`): argumentos viram placeholders tipados, e a
 * seleção de resposta usa os campos de 1º nível já descobertos (ou `__typename`
 * quando o tipo de retorno é um objeto sem campos mapeados — sempre válido).
 */
export function buildExampleQuery(detail: OperationSchemaDetail): string {
  const inputTypesByName = new Map(detail.requestInputTypes.map((t) => [t.typeName, t]));

  const argLines = detail.requestArgs.map(
    (row) => `${row.name}: ${argPlaceholder(row, inputTypesByName)}`
  );
  const argsBlock = argLines.length ? `(\n    ${argLines.join("\n    ")}\n  )` : "";

  const isObjectReturn = detail.responseTypeName != null;
  const selectionFields = detail.responseFields.length
    ? detail.responseFields.map((f) => f.name)
    : ["__typename"];
  const selectionBlock = isObjectReturn ? ` {\n    ${selectionFields.join("\n    ")}\n  }` : "";

  return `${detail.kind} ${detail.operationName} {\n  ${detail.operationName}${argsBlock}${selectionBlock}\n}`;
}

function operationKey(kind: "query" | "mutation", name: string): string {
  return `${kind}:${name}`;
}

/**
 * Lê o schema sincronizado e o manual atual do projeto e devolve uma sugestão
 * por campo raiz (`query`/`mutation`) descoberto — marcando quais já existem
 * no manual para a UI não deixar adicionar duplicado.
 */
export async function getSuggestedOperations(slug: string): Promise<SuggestOperationsResult> {
  const snapshot = await readProjectSchemaSnapshot(slug);
  if (!snapshot) {
    return { hasSchema: false, suggestions: [] };
  }

  const manual = await getManual(slug);
  const existing = new Set(
    (manual?.operations ?? [])
      .filter((op) => op.kind === "query" || op.kind === "mutation")
      .map((op) => operationKey(op.kind as "query" | "mutation", op.name))
  );

  const reference = buildSchemaReferenceView(snapshot);
  const fields: Array<{ kind: "query" | "mutation"; name: string; description?: string }> = [
    ...reference.queries.map((field) => ({ kind: "query" as const, ...field })),
    ...reference.mutations.map((field) => ({ kind: "mutation" as const, ...field })),
  ];

  const suggestions: SuggestedOperation[] = fields.map((field) => {
    const detail = buildOperationSchemaDetail(snapshot, field.kind, field.name);

    return {
      kind: field.kind,
      name: field.name,
      alreadyAdded: existing.has(operationKey(field.kind, field.name)),
      schemaDescription: field.description,
      draft: {
        kind: field.kind,
        name: field.name,
        title: humanizeFieldName(field.name),
        description: field.description,
        exampleQuery: detail ? buildExampleQuery(detail) : undefined,
        authRequired: true,
      },
    };
  });

  return { hasSchema: true, suggestions };
}
