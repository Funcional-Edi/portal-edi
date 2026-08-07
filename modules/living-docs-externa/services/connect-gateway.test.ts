import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import { connectGateway, ConnectGatewayError } from "@/modules/living-docs-externa/services/connect-gateway";
import { createProject } from "@/modules/living-docs-externa/repository/project-repository";
import { loadGatewayCredentials } from "@/modules/living-docs-externa/services/gateway-credentials";

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe("connectGateway service", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;
  const originalAuthSecret = process.env.AUTH_SECRET;
  const fetchMock = vi.fn();

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-connect-"));
    process.env.CONTENT_ROOT = tempRoot;
    process.env.AUTH_SECRET = "test-secret-nao-usar-em-producao";
    revalidateTagMock.mockClear();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);

    await createProject({ slug: "demo", name: "Demo" });
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;

    if (originalAuthSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = originalAuthSecret;

    vi.unstubAllGlobals();
    await rm(tempRoot, { recursive: true, force: true });
  });

  const validInput = {
    graphqlUrl: "https://gateway.parceiro.com.br/graphql",
    login: "user1",
    password: "senha-forte",
  };

  it("conecta com sucesso: cifra credenciais, atualiza config e invalida cache", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: { createToken: { token: "abc123" } } })
    );

    const config = await connectGateway("demo", validInput);

    expect(config.graphqlUrl).toBe(validInput.graphqlUrl);
    expect(config.gatewaySlug).toBe("demo");

    expect(fetchMock).toHaveBeenCalledWith(
      validInput.graphqlUrl,
      expect.objectContaining({ method: "POST" })
    );

    const credentials = await loadGatewayCredentials("demo");
    expect(credentials).toEqual({ login: "user1", password: "senha-forte" });

    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:projects");
    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
  });

  it("usa gatewaySlug informado quando presente", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: { createToken: { token: "abc123" } } })
    );

    const config = await connectGateway("demo", { ...validInput, gatewaySlug: "produto-x" });
    expect(config.gatewaySlug).toBe("produto-x");
  });

  it("rejeita entrada inválida sem chamar o gateway", async () => {
    await expect(connectGateway("demo", { graphqlUrl: "https://x.com" })).rejects.toMatchObject({
      code: "VALIDATION",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejeita URL privada/SSRF sem chamar o gateway", async () => {
    await expect(
      connectGateway("demo", { ...validInput, graphqlUrl: "https://10.0.0.5/graphql" })
    ).rejects.toMatchObject({ code: "INVALID_URL" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejeita projeto inexistente sem chamar o gateway", async () => {
    await expect(connectGateway("nao-existe", validInput)).rejects.toMatchObject({
      code: "PROJECT_NOT_FOUND",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejeita quando o gateway recusa as credenciais", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ errors: [{ message: "invalid login" }] })
    );

    await expect(connectGateway("demo", validInput)).rejects.toMatchObject({
      code: "GATEWAY_INVALID_CREDENTIALS",
    });

    const credentials = await loadGatewayCredentials("demo");
    expect(credentials).toBeNull();
  });

  it("rejeita quando o gateway está indisponível (erro de rede)", async () => {
    fetchMock.mockRejectedValueOnce(new Error("fetch failed"));

    await expect(connectGateway("demo", validInput)).rejects.toMatchObject({
      code: "GATEWAY_UNAVAILABLE",
    });
  });

  it("rejeita quando o gateway responde HTTP de erro", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500));

    await expect(connectGateway("demo", validInput)).rejects.toMatchObject({
      code: "GATEWAY_UNAVAILABLE",
    });
  });

  it("não persiste credenciais nem config quando ConnectGatewayError é lançado", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ errors: [{ message: "nope" }] }));

    await expect(connectGateway("demo", validInput)).rejects.toBeInstanceOf(ConnectGatewayError);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });
});
