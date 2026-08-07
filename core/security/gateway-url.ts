/**
 * Validação anti-SSRF da URL do gateway GraphQL (produtos, não SSO).
 *
 * O admin digita a URL do gateway ao conectar um projeto (Fase 3.2) e o
 * servidor faz `fetch` nela (mutation `createToken`). Sem validação, um
 * admin comprometido ou um valor malicioso poderia apontar para endereços
 * internos (metadata de nuvem, serviços privados) — SSRF clássico.
 *
 * ⚠️ Isso NÃO é sobre `FUNCIONAL_SSO_GRAPHQL_URL` (login do portal). Ver
 * `core/auth/sso.ts`.
 */

import { env } from "@/core/config/env";

export class GatewayUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GatewayUrlError";
  }
}

const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0", "::1", "[::1]"]);

/** IPv4 em faixas privadas/reservadas (RFC 1918, loopback, link-local). */
function isPrivateIPv4(hostname: string): boolean {
  const parts = hostname.split(".");
  if (parts.length !== 4) return false;
  const octets = parts.map(Number);
  if (octets.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;

  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function readAllowlist(): string[] {
  const raw = process.env.GATEWAY_URL_ALLOWED_HOSTS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

function matchesAllowlist(hostname: string, allowlist: string[]): boolean {
  return allowlist.some((allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`));
}

/**
 * Valida e normaliza a URL do gateway. Lança `GatewayUrlError` com mensagem
 * segura para exibir ao admin. Em desenvolvimento, permite `http`/localhost
 * para facilitar testes contra um gateway local.
 */
export function validateGatewayUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new GatewayUrlError("URL do gateway inválida.");
  }

  if (url.protocol !== "https:" && !(url.protocol === "http:" && env.isDevelopment)) {
    throw new GatewayUrlError("URL do gateway deve usar https.");
  }

  if (url.username || url.password) {
    throw new GatewayUrlError("URL do gateway não pode conter credenciais embutidas.");
  }

  const hostname = url.hostname.toLowerCase();
  if (!env.isDevelopment) {
    if (BLOCKED_HOSTNAMES.has(hostname)) {
      throw new GatewayUrlError("URL do gateway não pode apontar para host local.");
    }
    if (isPrivateIPv4(hostname)) {
      throw new GatewayUrlError("URL do gateway não pode apontar para rede privada.");
    }
  }

  const allowlist = readAllowlist();
  if (allowlist.length > 0 && !matchesAllowlist(hostname, allowlist)) {
    throw new GatewayUrlError(`Host "${hostname}" não está na allowlist de gateways permitidos.`);
  }

  return url;
}

export function isGatewayUrlAllowed(rawUrl: string): boolean {
  try {
    validateGatewayUrl(rawUrl);
    return true;
  } catch {
    return false;
  }
}
