import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import { connectApi, ConnectApiError } from "@/modules/living-docs-externa/services/connect-api";
import { createProject } from "@/modules/living-docs-externa/repository/project-repository";
import { loadGatewayCredentials } from "@/modules/living-docs-externa/services/gateway-credentials";

describe("connectApi service", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;
  const originalAuthSecret = process.env.AUTH_SECRET;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-connect-api-"));
    process.env.CONTENT_ROOT = tempRoot;
    process.env.AUTH_SECRET = "test-secret-nao-usar-em-producao";
    revalidateTagMock.mockClear();

    await createProject({ slug: "psp-demo", name: "PSP Demo", protocol: "rest" });
    await createProject({ slug: "graphql-demo", name: "GraphQL Demo", protocol: "graphql" });
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;

    if (originalAuthSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = originalAuthSecret;

    await rm(tempRoot, { recursive: true, force: true });
  });

  const validInput = {
    apiBaseUrl: "https://api.parceiro.com.br",
    login: "user1",
    password: "senha-forte",
  };

  it("conecta com sucesso: cifra credenciais e atualiza apiBaseUrl (sem chamar rede)", async () => {
    const config = await connectApi("psp-demo", validInput);

    // `validateGatewayUrl` normaliza via `new URL(...)`, que adiciona a barra final.
    expect(config.apiBaseUrl).toBe(`${validInput.apiBaseUrl}/`);

    const credentials = await loadGatewayCredentials("psp-demo");
    expect(credentials).toEqual({ login: "user1", password: "senha-forte" });

    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:projects");
    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:psp-demo");
  });

  it("rejeita entrada inválida", async () => {
    await expect(connectApi("psp-demo", { apiBaseUrl: "https://x.com" })).rejects.toMatchObject({
      code: "VALIDATION",
    });
  });

  it("rejeita URL privada/SSRF", async () => {
    await expect(
      connectApi("psp-demo", { ...validInput, apiBaseUrl: "https://10.0.0.5" })
    ).rejects.toMatchObject({ code: "INVALID_URL" });
  });

  it("rejeita projeto inexistente", async () => {
    await expect(connectApi("nao-existe", validInput)).rejects.toMatchObject({
      code: "PROJECT_NOT_FOUND",
    });
  });

  it("rejeita projeto com protocol graphql", async () => {
    await expect(connectApi("graphql-demo", validInput)).rejects.toMatchObject({
      code: "WRONG_PROTOCOL",
    });
  });

  it("não persiste nada quando ConnectApiError é lançado", async () => {
    await expect(connectApi("graphql-demo", validInput)).rejects.toBeInstanceOf(ConnectApiError);
    expect(revalidateTagMock).not.toHaveBeenCalled();
    expect(await loadGatewayCredentials("graphql-demo")).toBeNull();
  });
});
