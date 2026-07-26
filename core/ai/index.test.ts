import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateText, getAiProvider, getCostSummary } from "@/core/ai";
import { resetCost } from "@/core/ai/cost";

describe("camada de IA", () => {
  beforeEach(() => resetCost());
  afterEach(() => {
    delete process.env.AI_MONTHLY_BUDGET_USD;
  });

  it("usa o provedor stub quando nenhum provedor real está configurado", () => {
    expect(getAiProvider().name).toBe("stub");
  });

  it("gera texto e registra o uso por caso de uso", async () => {
    const resultado = await generateText({
      feature: "gerar-manual",
      messages: [{ role: "user", content: "Descreva a operação orders." }],
    });

    expect(resultado.text).toContain("gerar-manual");
    expect(resultado.provider).toBe("stub");
    expect(getCostSummary().byFeature).toHaveProperty("gerar-manual");
  });

  it("aplica guardrails: segredo não chega ao provedor", async () => {
    const resultado = await generateText({
      feature: "resumo",
      messages: [{ role: "user", content: "GITHUB_TOKEN=ghp_supersecreto123" }],
    });

    expect(resultado.text).not.toContain("ghp_supersecreto123");
  });

  it("bloqueia geração ao estourar o teto de custo mensal", async () => {
    process.env.AI_MONTHLY_BUDGET_USD = "-1";

    await expect(
      generateText({ feature: "x", messages: [{ role: "user", content: "oi" }] })
    ).rejects.toThrowError(/teto de custo/i);
  });
});
