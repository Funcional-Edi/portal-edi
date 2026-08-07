import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import {
  createProject,
  updateProjectGatewayConfig,
} from "@/modules/living-docs-externa/repository/project-repository";
import { readProjectSchemaSnapshot } from "@/modules/living-docs-externa/repository/schema-repository";
import { saveGatewayCredentials } from "@/modules/living-docs-externa/services/gateway-credentials";
import { syncSchema } from "@/modules/living-docs-externa/services/sync-schema";

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe("syncSchema service", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;
  const originalAuthSecret = process.env.AUTH_SECRET;
  const fetchMock = vi.fn();

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-sync-schema-"));
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

  it("sincroniza schema e persiste snapshot com resumo", async () => {
    await updateProjectGatewayConfig("demo", {
      graphqlUrl: "https://gateway.parceiro.com.br/graphql",
      gatewaySlug: "produto-demo",
    });
    await saveGatewayCredentials("demo", {
      login: "user1",
      password: "senha-forte",
    });

    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { createToken: { token: "jwt-1" } } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            __schema: {
              queryType: { name: "Query" },
              mutationType: { name: "Mutation" },
              types: [
                { kind: "OBJECT", name: "Query", fields: [{ name: "health" }, { name: "project" }] },
                { kind: "OBJECT", name: "Mutation", fields: [{ name: "createToken" }] },
                { kind: "SCALAR", name: "String" },
              ],
            },
          },
        })
      );

    const result = await syncSchema("demo");

    expect(result.slug).toBe("demo");
    expect(result.typeCount).toBe(3);
    expect(result.queryFieldCount).toBe(2);
    expect(result.mutationFieldCount).toBe(1);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://gateway.parceiro.com.br/graphql",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://gateway.parceiro.com.br/graphql",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-1",
        }),
      })
    );

    const snapshot = await readProjectSchemaSnapshot("demo");
    expect(snapshot?.source.graphqlUrl).toBe("https://gateway.parceiro.com.br/graphql");
    expect(snapshot?.summary).toEqual({
      typeCount: 3,
      queryFieldCount: 2,
      mutationFieldCount: 1,
    });

    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:projects");
    expect(revalidateTagMock).toHaveBeenCalledWith("living-docs:project:demo");
  });

  it("falha quando projeto não está conectado ao gateway", async () => {
    await expect(syncSchema("demo")).rejects.toMatchObject({
      code: "GATEWAY_NOT_CONNECTED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falha quando config tem URL inválida", async () => {
    await updateProjectGatewayConfig("demo", {
      graphqlUrl: "https://10.0.0.5/graphql",
      gatewaySlug: "demo",
    });
    await saveGatewayCredentials("demo", {
      login: "user1",
      password: "senha-forte",
    });

    await expect(syncSchema("demo")).rejects.toMatchObject({
      code: "INVALID_URL",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falha quando credenciais salvas não geram token", async () => {
    await updateProjectGatewayConfig("demo", {
      graphqlUrl: "https://gateway.parceiro.com.br/graphql",
      gatewaySlug: "demo",
    });
    await saveGatewayCredentials("demo", {
      login: "user1",
      password: "senha-forte",
    });

    fetchMock.mockResolvedValueOnce(jsonResponse({ errors: [{ message: "invalid login" }] }));

    await expect(syncSchema("demo")).rejects.toMatchObject({
      code: "GATEWAY_INVALID_CREDENTIALS",
    });
  });

  it("falha quando introspection retorna erro", async () => {
    await updateProjectGatewayConfig("demo", {
      graphqlUrl: "https://gateway.parceiro.com.br/graphql",
      gatewaySlug: "demo",
    });
    await saveGatewayCredentials("demo", {
      login: "user1",
      password: "senha-forte",
    });

    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { createToken: { token: "jwt-1" } } }))
      .mockResolvedValueOnce(jsonResponse({ errors: [{ message: "schema disabled" }] }));

    await expect(syncSchema("demo")).rejects.toMatchObject({
      code: "INTROSPECTION_FAILED",
    });
  });
});
