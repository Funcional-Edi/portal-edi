import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { validateEnv, requireEnv, optionalEnv } from "@/core/config/env";

const original = { ...process.env };

describe("configuração de ambiente", () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = "segredo-de-teste";
    delete process.env.DEV_AUTH_ENABLED;
    delete process.env.AI_API_KEY;
    process.env.AI_PROVIDER = "stub";
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it("não aponta problemas quando o mínimo está configurado", () => {
    expect(validateEnv()).toEqual([]);
  });

  it("acusa ausência de AUTH_SECRET", () => {
    delete process.env.AUTH_SECRET;
    expect(validateEnv().join(" ")).toMatch(/AUTH_SECRET/);
  });

  it("acusa provedor de IA configurado sem chave", () => {
    process.env.AI_PROVIDER = "openai";
    expect(validateEnv().join(" ")).toMatch(/AI_API_KEY/);
  });

  it("acusa SSO e allowlist ausentes em produção", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.FUNCIONAL_SSO_GRAPHQL_URL;
    delete process.env.GATEWAY_URL_ALLOWED_HOSTS;
    expect(validateEnv().join(" ")).toMatch(/FUNCIONAL_SSO_GRAPHQL_URL/);
    expect(validateEnv().join(" ")).toMatch(/GATEWAY_URL_ALLOWED_HOSTS/);
    vi.unstubAllEnvs();
  });

  it("requireEnv lança quando a variável não existe", () => {
    expect(() => requireEnv("VARIAVEL_INEXISTENTE")).toThrowError(/obrigatória/i);
  });

  it("optionalEnv devolve o fallback quando a variável não existe", () => {
    expect(optionalEnv("VARIAVEL_INEXISTENTE", "padrao")).toBe("padrao");
  });
});
