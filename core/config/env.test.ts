import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { env, validateEnv, requireEnv, optionalEnv } from "@/core/config/env";

const original = { ...process.env };

describe("configuração de ambiente", () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = "segredo-de-teste";
    delete process.env.DEV_AUTH_ENABLED;
    delete process.env.VERCEL_ENV;
    delete process.env.AI_API_KEY;
    delete process.env.LOCAL_EMERGENCY_ACCOUNTS_JSON;
    delete process.env.SSO_URL_ALLOWED_HOSTS;
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
    delete process.env.SSO_URL_ALLOWED_HOSTS;
    delete process.env.LOCAL_EMERGENCY_ACCOUNTS_JSON;
    expect(validateEnv().join(" ")).toMatch(/FUNCIONAL_SSO_GRAPHQL_URL/);
    expect(validateEnv().join(" ")).toMatch(/GATEWAY_URL_ALLOWED_HOSTS/);
    expect(validateEnv().join(" ")).toMatch(/SSO_URL_ALLOWED_HOSTS/);
    expect(validateEnv().join(" ")).toMatch(/LOCAL_EMERGENCY_ACCOUNTS_JSON/);
    vi.unstubAllEnvs();
  });
  it("habilita login dev local quando DEV_AUTH_ENABLED=true", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_AUTH_ENABLED", "true");
    expect(env.isDevAuthEnabled).toBe(true);
    vi.unstubAllEnvs();
  });

  it("habilita login dev em Preview, mas não em Production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("DEV_AUTH_ENABLED", "true");
    expect(env.isDevAuthEnabled).toBe(true);

    vi.stubEnv("VERCEL_ENV", "production");
    expect(env.isDevAuthEnabled).toBe(false);
    expect(validateEnv().join(" ")).toMatch(/DEV_AUTH_ENABLED/);
    vi.unstubAllEnvs();
  });

  it("esconde o login dev quando há SSO configurado", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_AUTH_ENABLED", "true");
    vi.stubEnv("FUNCIONAL_SSO_GRAPHQL_URL", "");
    expect(env.isDevLoginAvailable).toBe(true);
    vi.stubEnv("FUNCIONAL_SSO_GRAPHQL_URL", "https://sso.exemplo.test/graphql/");
    expect(env.isDevLoginAvailable).toBe(false);
    vi.unstubAllEnvs();
  });

  it("acusa ausência de Redis em produção, mas não quando está configurado", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FUNCIONAL_SSO_GRAPHQL_URL", "https://sso.exemplo.test/graphql/");
    vi.stubEnv("GATEWAY_URL_ALLOWED_HOSTS", "gw.exemplo.test");
    vi.stubEnv("KV_REST_API_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    expect(validateEnv().join(" ")).toMatch(/Redis/);
    vi.stubEnv("KV_REST_API_URL", "https://redis.exemplo.test");
    vi.stubEnv("KV_REST_API_TOKEN", "token-de-teste");
    expect(validateEnv().join(" ")).not.toMatch(/Redis/);
    vi.unstubAllEnvs();
  });

  it("requireEnv lança quando a variável não existe", () => {
    expect(() => requireEnv("VARIAVEL_INEXISTENTE")).toThrowError(/obrigatória/i);
  });

  it("optionalEnv devolve o fallback quando a variável não existe", () => {
    expect(optionalEnv("VARIAVEL_INEXISTENTE", "padrao")).toBe("padrao");
  });
});
