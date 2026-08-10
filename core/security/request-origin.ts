/**
 * Validação de Origin em requisições mutáveis (POST/PUT/PATCH/DELETE).
 * Complementa SameSite=Lax do cookie de sessão — bloqueia POST cross-site
 * de origens externas ao portal.
 */

function readAllowedHosts(): Set<string> {
  const hosts = new Set<string>();
  const requestHost = process.env.VERCEL_URL?.trim();
  if (requestHost) hosts.add(requestHost.replace(/^https?:\/\//, ""));

  const authUrl = process.env.AUTH_URL?.trim();
  if (authUrl) {
    try {
      hosts.add(new URL(authUrl).host);
    } catch {
      /* ignore */
    }
  }

  return hosts;
}

/** Retorna mensagem de erro ou `null` se a origem for confiável. */
export function validateMutationOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  const allowedHosts = readAllowedHosts();

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (allowedHosts.size === 0 || allowedHosts.has(originHost)) return null;
      return "Origin não autorizado para esta operação.";
    } catch {
      return "Origin inválido.";
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (allowedHosts.size === 0 || allowedHosts.has(refererHost)) return null;
      return "Referer não autorizado para esta operação.";
    } catch {
      return "Referer inválido.";
    }
  }

  // Requisições server-side (sem Origin/Referer) — permitir.
  return null;
}
