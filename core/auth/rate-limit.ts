/**
 * Limite de tentativas de login do SSO — protege contra força bruta
 * (ver docs/arquitetura/adr/0007-rate-limit-login.md).
 *
 * Duas camadas, mesma interface:
 * - Memória local: sempre disponível, reseta se a instância reiniciar.
 * - Redis REST (opcional): sobrevive a múltiplas instâncias/serverless.
 *   Sem `KV_REST_API_URL`/`TOKEN` configurados, cai para memória — a
 *   proteção nunca fica desligada, só perde durabilidade entre instâncias.
 */

import { getRedisRestConfig, redisRestCommand } from "@/core/auth/redis-rest";

const WINDOW_MS = 15 * 60 * 1000;
const WINDOW_SEC = Math.ceil(WINDOW_MS / 1000);
const MAX_ATTEMPTS = 10;
const KEY_PREFIX = "portal-edi:login-rate:";

export interface LoginRateLimitResult {
  allowed: boolean;
  /** Segundos até poder tentar de novo — só presente quando `allowed` é falso. */
  retryAfterSec?: number;
}

const memoryAttempts = new Map<string, { count: number; resetAt: number }>();

function checkMemory(key: string): LoginRateLimitResult {
  const now = Date.now();
  const entry = memoryAttempts.get(key);

  if (!entry || now >= entry.resetAt) {
    memoryAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true };
}

function resetMemory(key: string): void {
  memoryAttempts.delete(key);
}

async function checkDistributed(key: string): Promise<LoginRateLimitResult> {
  const redisKey = `${KEY_PREFIX}${key}`;
  try {
    const count = Number(await redisRestCommand("incr", redisKey));
    if (count === 1) await redisRestCommand("expire", redisKey, WINDOW_SEC);

    if (count > MAX_ATTEMPTS) {
      const ttl = Number(await redisRestCommand("ttl", redisKey));
      return { allowed: false, retryAfterSec: ttl > 0 ? ttl : WINDOW_SEC };
    }
    return { allowed: true };
  } catch {
    // Redis fora do ar não pode derrubar o login — cai para memória.
    return checkMemory(key);
  }
}

async function resetDistributed(key: string): Promise<void> {
  try {
    await redisRestCommand("del", `${KEY_PREFIX}${key}`);
  } catch {
    resetMemory(key);
  }
}

/** Verifica se `key` (e-mail normalizado) ainda pode tentar login agora. */
export async function checkLoginRateLimit(key: string): Promise<LoginRateLimitResult> {
  return getRedisRestConfig() ? checkDistributed(key) : checkMemory(key);
}

/** Zera o contador de `key`. Chamar após login bem-sucedido. */
export async function resetLoginRateLimit(key: string): Promise<void> {
  if (getRedisRestConfig()) {
    await resetDistributed(key);
    return;
  }
  resetMemory(key);
}

/** Uso em testes: limpa todo o estado em memória entre casos. */
export function resetAllMemoryRateLimits(): void {
  memoryAttempts.clear();
}
