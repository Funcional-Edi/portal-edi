/**
 * Camada de dados da fundação.
 *
 * ESTADO ATUAL: stateless-first. Não há banco relacional (ver ADR-0002).
 * Este módulo é a "costura" para um banco futuro (ex.: PostgreSQL) sem
 * reescrever o resto. Enquanto não precisamos, não introduzimos.
 *
 * ALERTA: quando um recurso exigir dados TRANSACIONAIS/RELACIONAIS
 * (homologação, auditoria, fila), chame `requireDatabase(...)` para falhar
 * alto e claro em vez de improvisar persistência.
 */

import { AppError } from "@/core/errors";

export type DataCapability =
  | "content"
  | "transactional"
  | "audit-log"
  | "full-text-search"
  | "vector-search"
  | "queue";

/** Capacidades disponíveis hoje. Ao ligar um banco, acrescente aqui. */
const AVAILABLE_CAPABILITIES: ReadonlySet<DataCapability> = new Set<DataCapability>([
  "content",
]);

export class DatabaseRequiredError extends AppError {
  readonly feature: string;
  readonly capability: DataCapability;

  constructor(feature: string, capability: DataCapability) {
    super(
      "database_required",
      `⚠️ O recurso "${feature}" exige a capacidade de dados "${capability}", ` +
        `indisponível na fundação stateless atual. Decida a introdução de um ` +
        `banco antes de implementar (ver docs/arquitetura/adr/0002-camada-dados-adapter.md).`,
      501,
      { feature, capability }
    );
    this.feature = feature;
    this.capability = capability;
  }
}

export function isDatabaseAvailable(capability: DataCapability): boolean {
  return AVAILABLE_CAPABILITIES.has(capability);
}

export function requireDatabase(feature: string, capability: DataCapability): void {
  if (isDatabaseAvailable(capability)) return;
  throw new DatabaseRequiredError(feature, capability);
}
