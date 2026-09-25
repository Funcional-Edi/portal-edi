import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
  // `getPublishedManual` usa unstable_cache; em teste vira passthrough para
  // não cachear entre casos (cada teste monta seu próprio projeto/estado).
  unstable_cache: (loader: () => Promise<unknown>) => loader,
}));

import {
  createProject,
  updateProjectGatewayConfig,
  updateProjectPublishStatus,
} from "@/modules/living-docs-externa/repository/project-repository";
import { saveGatewayCredentials } from "@/modules/living-docs-externa/services/gateway-credentials";
import { PlaygroundProxyError, runPlaygroundQuery } from "@/modules/living-docs-externa/services/proxy-playground";

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe("runPlaygroundQuery", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;
  const originalAuthSecret = process.env.AUTH_SECRET;
  const fetchMock = vi.fn();

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-proxy-playground-"));
    process.env.CONTENT_ROOT = tempRoot;
    process.env.AUTH_SECRET = "test-secret-nao-usar-em-producao";
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);

    await createProject({ slug: "demo", name: "Demo" });
    await updateProjectGatewayConfig("demo", {
      graphqlUrl: "https://gateway.parceiro.com.br/graphql",
      gatewaySlug: "demo",
    });
    await saveGatewayCredentials("demo", { login: "user1", password: "senha-forte" });
    await updateProjectPublishStatus("demo", true);
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;

    if (originalAuthSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = originalAuthSecret;

    vi.unstubAllGlobals();
    await rm(tempRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  });

  it("obtém token e encaminha a query, devolvendo { data, errors }", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { createToken: { token: "jwt-1" } } }))
      .mockResolvedValueOnce(jsonResponse({ data: { listarPedidos: [{ id: 1 }] } }));

    const result = await runPlaygroundQuery("demo", "query { listarPedidos { id } }");

    expect(result).toEqual({ data: { listarPedidos: [{ id: 1 }] }, errors: undefined });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://gateway.parceiro.com.br/graphql",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://gateway.parceiro.com.br/graphql",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer jwt-1" }),
      })
    );

    const secondCallBody = JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string);
    expect(secondCallBody.query).toBe("query { listarPedidos { id } }");
  });

  it("repassa variables ao gateway", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { createToken: { token: "jwt-1" } } }))
      .mockResolvedValueOnce(jsonResponse({ data: { pedido: { id: 7 } } }));

    await runPlaygroundQuery("demo", "query($id: ID!) { pedido(id: $id) { id } }", { id: "7" });

    const secondCallBody = JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string);
    expect(secondCallBody.variables).toEqual({ id: "7" });
  });

  it("repassa erros de negócio da query como { errors } sem lançar", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { createToken: { token: "jwt-1" } } }))
      .mockResolvedValueOnce(jsonResponse({ errors: [{ message: "argumento inválido" }] }));

    const result = await runPlaygroundQuery("demo", "query { listarPedidos { id } }");
    expect(result.errors).toEqual([{ message: "argumento inválido" }]);
  });

  it("rejeita projeto inexistente", async () => {
    await expect(runPlaygroundQuery("nao-existe", "query { x { id } }")).rejects.toMatchObject({
      code: "PROJECT_NOT_FOUND",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejeita projeto não publicado", async () => {
    await updateProjectPublishStatus("demo", false);

    await expect(runPlaygroundQuery("demo", "query { listarPedidos { id } }")).rejects.toMatchObject({
      code: "PROJECT_NOT_FOUND",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejeita quando gateway não está conectado", async () => {
    await createProject({ slug: "sem-gateway", name: "Sem gateway" });
    await updateProjectPublishStatus("sem-gateway", true);

    await expect(
      runPlaygroundQuery("sem-gateway", "query { listarPedidos { id } }")
    ).rejects.toMatchObject({ code: "GATEWAY_NOT_CONNECTED" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejeita quando o gateway está indisponível", async () => {
    fetchMock.mockRejectedValueOnce(new Error("fetch failed"));

    await expect(runPlaygroundQuery("demo", "query { listarPedidos { id } }")).rejects.toMatchObject(
      { code: "GATEWAY_UNAVAILABLE" }
    );
  });

  it("rejeita quando as credenciais salvas não são mais aceitas", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ errors: [{ message: "invalid login" }] }));

    await expect(runPlaygroundQuery("demo", "query { listarPedidos { id } }")).rejects.toMatchObject(
      { code: "GATEWAY_INVALID_CREDENTIALS" }
    );
  });

  it("não expõe o token obtido no resultado devolvido ao chamador", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { createToken: { token: "jwt-secreto" } } }))
      .mockResolvedValueOnce(jsonResponse({ data: { listarPedidos: [] } }));

    const result = await runPlaygroundQuery("demo", "query { listarPedidos { id } }");
    expect(JSON.stringify(result)).not.toContain("jwt-secreto");
  });

  it("PlaygroundProxyError preserva o code", async () => {
    await expect(
      runPlaygroundQuery("nao-existe", "query { x { id } }")
    ).rejects.toBeInstanceOf(PlaygroundProxyError);
  });
});
