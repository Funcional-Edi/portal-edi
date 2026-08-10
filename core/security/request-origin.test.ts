import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { validateMutationOrigin } from "@/core/security/request-origin";

const original = { ...process.env };

describe("validateMutationOrigin", () => {
  beforeEach(() => {
    process.env.AUTH_URL = "http://localhost:3002";
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it("aceita origin compatível com AUTH_URL", () => {
    const request = new Request("http://localhost:3002/api/test", {
      method: "POST",
      headers: { origin: "http://localhost:3002" },
    });
    expect(validateMutationOrigin(request)).toBeNull();
  });

  it("rejeita origin externo", () => {
    const request = new Request("http://localhost:3002/api/test", {
      method: "POST",
      headers: { origin: "https://evil.example.com" },
    });
    expect(validateMutationOrigin(request)).toMatch(/Origin não autorizado/);
  });

  it("permite requisição sem origin (server-side)", () => {
    const request = new Request("http://localhost:3002/api/test", { method: "POST" });
    expect(validateMutationOrigin(request)).toBeNull();
  });
});
