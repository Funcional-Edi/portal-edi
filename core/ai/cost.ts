/**
 * Controle de custo de IA (Princípio 8): medir custo por uso e alertar ao
 * ultrapassar o teto mensal (AI_MONTHLY_BUDGET_USD). Começa in-memory; quando
 * precisar de persistência entre instâncias, vira um recurso que exige banco
 * (ver core/db → requireDatabase).
 */

import type { AiUsage } from "@/core/ai/types";

interface CostBucket {
  totalUsd: number;
  byFeature: Record<string, number>;
}

const bucket: CostBucket = { totalUsd: 0, byFeature: {} };

export function recordUsage(feature: string, usage: AiUsage): void {
  bucket.totalUsd += usage.estimatedCostUsd;
  bucket.byFeature[feature] =
    (bucket.byFeature[feature] ?? 0) + usage.estimatedCostUsd;
}

export function getCostSummary(): CostBucket {
  return { totalUsd: bucket.totalUsd, byFeature: { ...bucket.byFeature } };
}

/** Teto mensal configurável; retorna true se já estourou. */
export function isOverBudget(): boolean {
  const budget = Number(process.env.AI_MONTHLY_BUDGET_USD ?? "0");
  if (!budget) return false;
  return bucket.totalUsd >= budget;
}

export function resetCost(): void {
  bucket.totalUsd = 0;
  bucket.byFeature = {};
}
