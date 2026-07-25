import type { AiProvider, AiGenerateOptions, AiGenerateResult } from "@/core/ai/types";

/**
 * Provedor de IA "stub": sem custo e sem chamadas externas. Usado em dev/teste
 * e como default quando AI_PROVIDER=stub. Provedores reais (OpenAI/Anthropic)
 * implementam a mesma porta `AiProvider` e são plugados no factory (index.ts).
 */
export const stubAiProvider: AiProvider = {
  name: "stub",
  model: "stub-echo",
  async generate(options: AiGenerateOptions): Promise<AiGenerateResult> {
    const lastUser = [...options.messages].reverse().find((m) => m.role === "user");
    const text =
      `【IA stub — provedor real não configurado】\n` +
      `Caso de uso: ${options.feature}\n` +
      `Entrada recebida: ${lastUser?.content?.slice(0, 200) ?? "(vazio)"}`;
    return {
      text,
      usage: { promptTokens: 0, completionTokens: 0, estimatedCostUsd: 0 },
      provider: this.name,
      model: this.model,
    };
  },
};
