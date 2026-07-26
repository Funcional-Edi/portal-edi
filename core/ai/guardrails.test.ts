import { describe, it, expect } from "vitest";
import { redactSecrets, assertSafeOutput } from "@/core/ai/guardrails";

describe("guardrails de IA — proteção de dados sensíveis", () => {
  it("remove token JWT antes de enviar ao provedor", () => {
    const entrada = "use o token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.cGF5bG9hZA.assinatura";
    const saida = redactSecrets(entrada);

    expect(saida).toContain("[TOKEN]");
    expect(saida).not.toContain("cGF5bG9hZA");
  });

  it("remove segredos declarados como chave=valor", () => {
    const saida = redactSecrets("GITHUB_TOKEN=ghp_abc123 e senha: minhaSenha");

    expect(saida).not.toContain("ghp_abc123");
    expect(saida).not.toContain("minhaSenha");
    expect(saida).toContain("[SECRET]");
  });

  it("remove chave privada em bloco PEM", () => {
    const pem =
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg\n-----END PRIVATE KEY-----";
    const saida = redactSecrets(`config: ${pem}`);

    expect(saida).toContain("[PRIVATE_KEY]");
    expect(saida).not.toContain("MIIEvQIBADANBg");
  });

  it("preserva texto comum sem segredos", () => {
    const texto = "Gere um manual para a operação createInvoice.";
    expect(redactSecrets(texto)).toBe(texto);
  });

  it("aceita saída válida e devolve sem espaços nas pontas", () => {
    expect(assertSafeOutput("  resposta ok  ")).toBe("resposta ok");
  });

  it("rejeita saída vazia da IA", () => {
    expect(() => assertSafeOutput("   ")).toThrowError(/vazia/i);
  });
});
