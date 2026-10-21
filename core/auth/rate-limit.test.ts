import { describe, it, expect, afterEach } from "vitest";
import {
  checkLoginRateLimit,
  resetLoginRateLimit,
  resetAllMemoryRateLimits,
} from "@/core/auth/rate-limit";

describe("rate limit de login (fallback em memória)", () => {
  const email = "rate-limit-test@example.com";

  afterEach(async () => {
    await resetLoginRateLimit(email);
    resetAllMemoryRateLimits();
  });

  it("permite tentativas dentro do limite", async () => {
    for (let i = 0; i < 10; i++) {
      const result = await checkLoginRateLimit(email);
      expect(result.allowed).toBe(true);
    }
  });

  it("bloqueia a partir da 11ª tentativa na mesma janela", async () => {
    for (let i = 0; i < 10; i++) {
      await checkLoginRateLimit(email);
    }
    const blocked = await checkLoginRateLimit(email);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec ?? 0).toBeGreaterThan(0);
  });

  it("libera de novo após reset (login bem-sucedido)", async () => {
    for (let i = 0; i < 10; i++) {
      await checkLoginRateLimit(email);
    }
    await resetLoginRateLimit(email);
    const result = await checkLoginRateLimit(email);
    expect(result.allowed).toBe(true);
  });

  it("chaves diferentes têm contadores independentes", async () => {
    for (let i = 0; i < 10; i++) {
      await checkLoginRateLimit(email);
    }
    const other = await checkLoginRateLimit("outro@example.com");
    expect(other.allowed).toBe(true);
    await resetLoginRateLimit("outro@example.com");
  });
});
