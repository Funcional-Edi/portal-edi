import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  decryptGatewayCredentials,
  encryptGatewayCredentials,
  loadGatewayCredentials,
  saveGatewayCredentials,
} from "@/modules/living-docs-externa/services/gateway-credentials";
import { writeCredentialsEnvelope } from "@/modules/living-docs-externa/repository/credentials-repository";

describe("gateway-credentials", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;
  const originalAuthSecret = process.env.AUTH_SECRET;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-credentials-"));
    process.env.CONTENT_ROOT = tempRoot;
    process.env.AUTH_SECRET = "test-secret-nao-usar-em-producao";
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;

    if (originalAuthSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = originalAuthSecret;

    await rm(tempRoot, { recursive: true, force: true });
  });

  it("cifra e decifra credenciais (round trip)", () => {
    const envelope = encryptGatewayCredentials({ login: "user1", password: "senha-forte" });

    expect(envelope.v).toBe(1);
    expect(envelope.ciphertext).not.toContain("senha-forte");

    const decrypted = decryptGatewayCredentials(envelope);
    expect(decrypted).toEqual({ login: "user1", password: "senha-forte" });
  });

  it("gera IV diferente a cada cifragem (nunca reusa nonce)", () => {
    const a = encryptGatewayCredentials({ login: "user1", password: "x" });
    const b = encryptGatewayCredentials({ login: "user1", password: "x" });
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it("falha ao decifrar se o envelope foi adulterado (GCM autenticado)", () => {
    const envelope = encryptGatewayCredentials({ login: "user1", password: "senha-forte" });
    const tampered = { ...envelope, ciphertext: Buffer.from("lixo-adulterado").toString("base64") };
    expect(() => decryptGatewayCredentials(tampered)).toThrow();
  });

  it("falha ao decifrar com AUTH_SECRET diferente do usado para cifrar", () => {
    const envelope = encryptGatewayCredentials({ login: "user1", password: "senha-forte" });
    process.env.AUTH_SECRET = "outro-secret-completamente-diferente";
    expect(() => decryptGatewayCredentials(envelope)).toThrow();
  });

  it("saveGatewayCredentials + loadGatewayCredentials persistem via repository", async () => {
    await saveGatewayCredentials("demo", { login: "user1", password: "senha-forte" });
    const loaded = await loadGatewayCredentials("demo");
    expect(loaded).toEqual({ login: "user1", password: "senha-forte" });
  });

  it("loadGatewayCredentials retorna null quando nunca conectado", async () => {
    const loaded = await loadGatewayCredentials("nunca-conectado");
    expect(loaded).toBeNull();
  });

  it("nunca grava login/senha em texto plano no arquivo", async () => {
    await saveGatewayCredentials("demo", { login: "user1", password: "senha-super-secreta" });
    const raw = await import("node:fs/promises").then((fs) =>
      fs.readFile(path.join(tempRoot, "data/projects/demo/credentials.enc"), "utf8")
    );
    expect(raw).not.toContain("senha-super-secreta");
    expect(raw).not.toContain("user1");
  });

  it("exige AUTH_SECRET para cifrar", () => {
    delete process.env.AUTH_SECRET;
    expect(() => encryptGatewayCredentials({ login: "user1", password: "x" })).toThrow();
  });

  it("propaga escrita via writeCredentialsEnvelope (repository) sem acesso a fs no service", async () => {
    await writeCredentialsEnvelope("via-repo", encryptGatewayCredentials({ login: "a", password: "b" }));
    const loaded = await loadGatewayCredentials("via-repo");
    expect(loaded).toEqual({ login: "a", password: "b" });
  });
});
