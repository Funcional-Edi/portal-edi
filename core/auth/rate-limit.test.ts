import { describe, it, expect, afterEach } from "vitest";
import {
  checkLoginAttempt,
  checkLoginRateLimit,
  getClientIp,
  resetLoginRateLimit,
  resetAllMemoryRateLimits,
} from "@/core/auth/rate-limit";

describe("limite por e-mail e por IP", () => {
  afterEach(() => resetAllMemoryRateLimits());

  it("bloqueia o e-mail na 11ª tentativa, mesmo vindo de IPs diferentes", async () => {
    for (let i = 0; i < 10; i++) {
      expect((await checkLoginAttempt("a@x.com", `10.0.0.${i}`)).allowed).toBe(true);
    }
    const blocked = await checkLoginAttempt("a@x.com", "10.0.0.99");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("bloqueia o IP na 31ª tentativa, mesmo com e-mails diferentes", async () => {
    for (let i = 0; i < 30; i++) {
      expect((await checkLoginAttempt(`u${i}@x.com`, "1.2.3.4")).allowed).toBe(true);
    }
    expect((await checkLoginAttempt("novo@x.com", "1.2.3.4")).allowed).toBe(false);
  });

  it("outro IP e outro e-mail continuam liberados", async () => {
    for (let i = 0; i < 11; i++) await checkLoginAttempt("a@x.com", "1.2.3.4");
    expect((await checkLoginAttempt("b@x.com", "5.6.7.8")).allowed).toBe(true);
  });

  it("getClientIp prefere x-real-ip e, senão, usa a última entrada de x-forwarded-for", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1" }))).toBe("9.9.9.9");
    expect(getClientIp(new Headers({ "x-forwarded-for": "6.6.6.6, 2.2.2.2" }))).toBe("2.2.2.2");
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

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
