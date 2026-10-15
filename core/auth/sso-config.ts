import { readContentJson, writeContentJson } from "@/core/db/adapters";

const SSO_CONFIG_PATH = "data/access/sso-config.json";
const SSO_CONFIG_BRANCH = "portal-state";

const CREATE_TOKEN_MUTATION = `
  mutation ProbeCreateToken($login: String!, $password: String!) {
    createToken(login: $login, password: $password) {
      token
    }
  }
`;

interface StoredSsoConfig {
  url: string;
  updatedAt: string;
  updatedBy: string;
}

function normalizeHost(hostname: string): string {
  return hostname.trim().toLowerCase();
}

export function getAllowedSsoHosts(): string[] {
  const raw = process.env.SSO_URL_ALLOWED_HOSTS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => normalizeHost(entry))
    .filter(Boolean);
}

export function validateSsoUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return "URL do SSO inválida.";
  }

  if (parsed.protocol !== "https:") {
    return "A URL do SSO deve usar https.";
  }

  const allowedHosts = getAllowedSsoHosts();
  if (allowedHosts.length > 0 && !allowedHosts.includes(normalizeHost(parsed.hostname))) {
    return "Host do SSO fora da allowlist.";
  }
  return null;
}

export async function loadStoredSsoConfig(): Promise<StoredSsoConfig | null> {
  const data = await readContentJson<unknown>(SSO_CONFIG_PATH, { ref: SSO_CONFIG_BRANCH });
  if (!data || typeof data !== "object") return null;

  const url = (data as { url?: unknown }).url;
  const updatedAt = (data as { updatedAt?: unknown }).updatedAt;
  const updatedBy = (data as { updatedBy?: unknown }).updatedBy;
  if (typeof url !== "string" || typeof updatedAt !== "string" || typeof updatedBy !== "string") {
    return null;
  }

  return { url, updatedAt, updatedBy };
}

export async function resolveSsoUrl(defaultUrl: string): Promise<string> {
  const stored = await loadStoredSsoConfig();
  if (!stored) return defaultUrl;
  if (validateSsoUrl(stored.url)) return defaultUrl;
  return stored.url;
}

export async function probeSsoUrl(url: string): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: CREATE_TOKEN_MUTATION,
      variables: { login: "__probe__", password: "__probe__" },
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) {
    throw new Error(`SSO indisponível (HTTP ${response.status}).`);
  }
  const payload = (await response.json()) as { data?: unknown; errors?: unknown };
  if (!("data" in payload) && !("errors" in payload)) {
    throw new Error("Resposta inesperada do endpoint SSO.");
  }
}

export async function saveSsoUrl(input: { url: string; updatedBy: string }): Promise<StoredSsoConfig> {
  const next: StoredSsoConfig = {
    url: input.url.trim(),
    updatedBy: input.updatedBy.trim().toLowerCase(),
    updatedAt: new Date().toISOString(),
  };

  await writeContentJson(SSO_CONFIG_PATH, next, {
    branch: SSO_CONFIG_BRANCH,
    message: "chore(acesso): atualiza URL do SSO",
  });
  return next;
}
