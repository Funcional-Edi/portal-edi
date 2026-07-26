/**
 * Cliente mínimo para um backend Redis compatível com REST (ex.: Upstash).
 *
 * Opcional: sem as variáveis de ambiente configuradas, `getRedisRestConfig()`
 * retorna `null` e quem chama (core/auth/rate-limit.ts) cai para o fallback
 * em memória — a proteção nunca desliga, só perde durabilidade entre
 * instâncias/serverless.
 */

interface RedisRestConfig {
  url: string;
  token: string;
}

export function getRedisRestConfig(): RedisRestConfig | null {
  const url =
    process.env.KV_REST_API_URL?.trim() ??
    process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token =
    process.env.KV_REST_API_TOKEN?.trim() ??
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

/** Executa um comando Redis via REST (ex.: `redisRestCommand("incr", chave)`). */
export async function redisRestCommand(
  ...segments: (string | number)[]
): Promise<unknown> {
  const config = getRedisRestConfig();
  if (!config) throw new Error("Redis REST não configurado");

  const path = segments.map((s) => encodeURIComponent(String(s))).join("/");
  const response = await fetch(`${config.url}/${path}`, {
    headers: { Authorization: `Bearer ${config.token}` },
    signal: AbortSignal.timeout(3000),
  });

  if (!response.ok) {
    throw new Error(`Redis REST falhou (HTTP ${response.status})`);
  }

  const payload = (await response.json()) as { result?: unknown; error?: string };
  if (payload.error) throw new Error(payload.error);
  return payload.result;
}
