/**
 * Fachada da camada de IA. Um único ponto para obter o provedor e gerar texto
 * com guardrails + controle de custo aplicados automaticamente.
 *
 * Uso: `const r = await generateText({ feature: "gerar-manual", messages });`
 */

import { env } from "@/core/config/env";
import { redactSecrets, assertSafeOutput } from "@/core/ai/guardrails";
import { recordUsage, isOverBudget } from "@/core/ai/cost";
import { stubAiProvider } from "@/core/ai/provider-stub";
import type { AiProvider, AiGenerateOptions, AiGenerateResult } from "@/core/ai/types";

export * from "@/core/ai/types";
export { getCostSummary, isOverBudget } from "@/core/ai/cost";

/**
 * Retorna o provedor de IA configurado. Hoje: apenas o stub. Ao integrar um
 * provedor real, adicione o case aqui (ex.: "openai" → openAiProvider).
 */
export function getAiProvider(): AiProvider {
  switch (env.aiProvider) {
    case "stub":
    default:
      return stubAiProvider;
  }
}

/** Gera texto aplicando redação de segredos, teto de custo e validação de saída. */
export async function generateText(
  options: AiGenerateOptions
): Promise<AiGenerateResult> {
  if (isOverBudget()) {
    throw new Error(
      "Teto de custo de IA (AI_MONTHLY_BUDGET_USD) atingido — geração bloqueada."
    );
  }

  const provider = getAiProvider();
  const safeMessages = options.messages.map((m) => ({
    ...m,
    content: redactSecrets(m.content),
  }));

  const result = await provider.generate({ ...options, messages: safeMessages });
  recordUsage(options.feature, result.usage);
  return { ...result, text: assertSafeOutput(result.text) };
}
