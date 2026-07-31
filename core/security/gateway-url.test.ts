import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GatewayUrlError, isGatewayUrlAllowed, validateGatewayUrl } from "@/core/security/gateway-url";

const originalEnv = { ...process.env };

describe("validateGatewayUrl", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GATEWAY_URL_ALLOWED_HOSTS;
    vi.stubEnv("NODE_ENV", "production");
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllEnvs();
  });

  it("aceita https público", () => {
    const url = validateGatewayUrl("https://gateway.parceiro.com.br/graphql");
    expect(url.hostname).toBe("gateway.parceiro.com.br");
  });

  it("rejeita URL malformada", () => {
    expect(() => validateGatewayUrl("não-é-url")).toThrow(GatewayUrlError);
  });

  it("rejeita protocolo http fora de desenvolvimento", () => {
    expect(() => validateGatewayUrl("http://gateway.parceiro.com.br/graphql")).toThrow(
      GatewayUrlError
    );
  });

  it("rejeita localhost fora de desenvolvimento", () => {
    expect(() => validateGatewayUrl("https://localhost:4000/graphql")).toThrow(GatewayUrlError);
  });

  it("rejeita IPs privados (RFC 1918)", () => {
    expect(() => validateGatewayUrl("https://10.0.0.5/graphql")).toThrow(GatewayUrlError);
    expect(() => validateGatewayUrl("https://172.16.0.5/graphql")).toThrow(GatewayUrlError);
    expect(() => validateGatewayUrl("https://192.168.1.5/graphql")).toThrow(GatewayUrlError);
  });

  it("rejeita link-local (metadata de nuvem)", () => {
    expect(() => validateGatewayUrl("https://169.254.169.254/latest/meta-data")).toThrow(
      GatewayUrlError
    );
  });

  it("rejeita credenciais embutidas na URL", () => {
    expect(() => validateGatewayUrl("https://user:pass@gateway.parceiro.com.br/graphql")).toThrow(
      GatewayUrlError
    );
  });

  it("permite http/localhost em desenvolvimento", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(() => validateGatewayUrl("http://localhost:4000/graphql")).not.toThrow();
  });

  it("aplica allowlist quando configurada", () => {
    process.env.GATEWAY_URL_ALLOWED_HOSTS = "parceiro.com.br,outrodominio.com";
    expect(() => validateGatewayUrl("https://gateway.parceiro.com.br/graphql")).not.toThrow();
    expect(() => validateGatewayUrl("https://gateway.naopermitido.com/graphql")).toThrow(
      GatewayUrlError
    );
  });

  it("isGatewayUrlAllowed retorna booleano sem lançar", () => {
    expect(isGatewayUrlAllowed("https://gateway.parceiro.com.br/graphql")).toBe(true);
    expect(isGatewayUrlAllowed("https://10.0.0.5/graphql")).toBe(false);
  });
});
