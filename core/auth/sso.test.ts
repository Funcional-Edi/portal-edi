import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetAllMemoryRateLimits } from "@/core/auth/rate-limit";
import { validateSsoCredentials } from "@/core/auth/sso";

// next-auth não carrega no Vitest (import ESM de "next/server"); só precisamos da classe base.
vi.mock("next-auth", () => ({
  CredentialsSignin: class extends Error {
    code = "credentials";
  },
}));

const SENHA = "<senha>"; // nunca usar senha real em teste
const EMAIL = "pessoa@empresa.com";

function mockSso(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: "x",
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function codeOf(promise: Promise<unknown>): Promise<string | undefined> {
  try {
    await promise;
  } catch (err) {
    return (err as { code?: string }).code;
  }
  return undefined;
}

describe("login SSO", () => {
  beforeEach(() => {
    vi.stubEnv("FUNCIONAL_SSO_GRAPHQL_URL", "https://sso.exemplo.test/graphql/");
    delete process.env.KV_REST_API_URL; // força contador em memória
    delete process.env.UPSTASH_REDIS_REST_URL;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    resetAllMemoryRateLimits();
  });

  it("login válido devolve o usuário sem expor o token", async () => {
    mockSso({ data: { createToken: { token: "tok-secreto", user: { id: "1", email: "Pessoa@Empresa.com", name: "Pessoa" } } } });
    const user = await validateSsoCredentials(EMAIL, SENHA, "1.1.1.1");
    expect(user).toEqual({ id: "1", email: EMAIL, name: "Pessoa" });
    expect(JSON.stringify(user)).not.toContain("tok-secreto");
  });

  it("usa o e-mail digitado quando o SSO não devolve user", async () => {
    mockSso({ data: { createToken: { token: "t" } } });
    const user = await validateSsoCredentials(EMAIL, SENHA, "1.1.1.1");
    expect(user).toMatchObject({ id: EMAIL, email: EMAIL });
  });

  it.each([
    ["senha errada", "Invalid credentials"],
    ["e-mail inexistente", "User not found"],
    ["conta bloqueada", "Usuário bloqueado por excesso de tentativas"],
    ["MFA exigido", "MFA code required"],
  ])("%s mostra sempre o mesmo erro genérico", async (_caso, mensagem) => {
    mockSso({ errors: [{ message: mensagem }] });
    expect(await codeOf(validateSsoCredentials(EMAIL, SENHA, "1.1.1.1"))).toBe("sso_invalid_credentials");
  });

  it("o erro lançado não carrega senha nem texto do SSO", async () => {
    mockSso({ errors: [{ message: `falha com ${SENHA}` }] });
    const err = await validateSsoCredentials(EMAIL, SENHA, "1.1.1.1").catch((e: Error) => e);
    expect(String((err as Error).message) + String((err as Error).stack)).not.toContain(SENHA);
  });

  it("SSO fora do ar (rede, timeout, HTTP 5xx) vira sso_unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    expect(await codeOf(validateSsoCredentials(EMAIL, SENHA, "1.1.1.1"))).toBe("sso_unavailable");

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("The operation was aborted due to timeout", "TimeoutError")));
    expect(await codeOf(validateSsoCredentials(EMAIL, SENHA, "1.1.1.2"))).toBe("sso_unavailable");

    mockSso({}, { ok: false, status: 503 });
    expect(await codeOf(validateSsoCredentials(EMAIL, SENHA, "1.1.1.3"))).toBe("sso_unavailable");
  });

  it("estourar o limite por e-mail dá sso_rate_limit sem chamar o SSO", async () => {
    const fetchMock = mockSso({ errors: [{ message: "Invalid credentials" }] });
    for (let i = 0; i < 10; i++) await codeOf(validateSsoCredentials(EMAIL, SENHA, `2.2.2.${i}`));
    fetchMock.mockClear();
    expect(await codeOf(validateSsoCredentials(EMAIL, SENHA, "2.2.2.200"))).toBe("sso_rate_limit");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("estourar o limite por IP dá sso_rate_limit mesmo com e-mails diferentes", async () => {
    mockSso({ errors: [{ message: "Invalid credentials" }] });
    for (let i = 0; i < 30; i++) await codeOf(validateSsoCredentials(`u${i}@empresa.com`, SENHA, "3.3.3.3"));
    expect(await codeOf(validateSsoCredentials("novo@empresa.com", SENHA, "3.3.3.3"))).toBe("sso_rate_limit");
  });
});
