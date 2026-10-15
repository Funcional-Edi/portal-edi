import { readContentJson, writeContentJson } from "@/core/db/adapters";
import { appendAccessAuditEvent } from "@/core/auth/access-audit";
import { getPermissionsConfig } from "@/core/auth/permissions-config";
import { env } from "@/core/config/env";
import { loadStoredSsoConfig } from "@/core/auth/sso-config";
import type { PermissionsConfig } from "@/core/auth/roles";

/** Lista gravada pelo admin master. A variável PERMISSIONS_CONFIG_JSON só cria o primeiro admin. */
export const ACCESS_LIST_PATH = "data/access/permissions.json";
/** Branch do estado do portal. A escrita nunca vai para main. */
export const ACCESS_LIST_BRANCH = "portal-state";

const EXACT_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AccessListError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessListError";
  }
}

function exactEmails(values: unknown, label: string): string[] {
  if (!Array.isArray(values)) throw new AccessListError(`${label} inválido.`);
  const out: string[] = [];
  for (const raw of values) {
    const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if (!email || email.startsWith("@") || !EXACT_EMAIL.test(email)) {
      throw new AccessListError(`${label}: use o e-mail exato, nunca o domínio.`);
    }
    if (!out.includes(email)) out.push(email);
  }
  return out;
}

export interface SsoPortalAccess {
  url: string;
  admins: string[];
  editors: string[];
}

export function ssoPortalKey(url: string): string {
  const parsed = new URL(url.trim());
  const path = parsed.pathname.replace(/\/+$/, "") || "/";
  return `${parsed.origin}${path}`;
}

/**
 * Lista do SSO que está em uso. Sem `ssoPortals`, vale a lista antiga.
 * SSO novo, com outras URLs já gravadas, começa sem ninguém.
 */
export function pickPortalList(
  saved: { admins?: unknown; editors?: unknown; ssoPortals?: unknown },
  activeUrl: string | null
): { admins: unknown; editors: unknown } | null {
  const portals = Array.isArray(saved.ssoPortals) ? saved.ssoPortals : [];
  if (portals.length === 0 || !activeUrl) return null;
  let key: string;
  try {
    key = ssoPortalKey(activeUrl);
  } catch {
    return null;
  }
  const found = portals.find((item) => {
    if (!item || typeof item !== "object" || typeof (item as { url?: unknown }).url !== "string") return false;
    try {
      return ssoPortalKey((item as { url: string }).url) === key;
    } catch {
      return false;
    }
  }) as { admins?: unknown; editors?: unknown } | undefined;
  if (!found) return { admins: [], editors: [] };
  return { admins: found.admins, editors: found.editors };
}

function readPortals(saved: { ssoPortals?: unknown }): SsoPortalAccess[] {
  if (!Array.isArray(saved.ssoPortals)) return [];
  return saved.ssoPortals.filter((item): item is SsoPortalAccess => {
    return !!item && typeof item === "object" && typeof (item as { url?: unknown }).url === "string";
  });
}

/**
 * Antes de trocar o endereço, prende a lista atual no SSO que está saindo.
 * Devolve null quando não há o que gravar (mesmo endereço, ou a lista já está presa).
 */
export function portalBucketsAfterLeaving(
  saved: { admins?: unknown; editors?: unknown; ssoPortals?: unknown },
  currentUrl: string,
  nextUrl: string,
  currentPeople: { admins: string[]; editors: string[] }
): SsoPortalAccess[] | null {
  let currentKey: string;
  let nextKey: string;
  try {
    currentKey = ssoPortalKey(currentUrl);
    nextKey = ssoPortalKey(nextUrl);
  } catch {
    return null;
  }
  if (currentKey === nextKey) return null;
  const portals = readPortals(saved);
  const already = portals.some((item) => {
    try {
      return ssoPortalKey(item.url) === currentKey;
    } catch {
      return false;
    }
  });
  if (already) return null;
  return [...portals, { url: currentUrl, admins: currentPeople.admins, editors: currentPeople.editors }];
}

/** Grava a lista de hoje no SSO atual, para o próximo endereço não herdar essas pessoas. */
export async function keepPeopleOnCurrentSso(nextUrl: string): Promise<void> {
  const currentUrl = (await loadStoredSsoConfig())?.url ?? process.env.FUNCIONAL_SSO_GRAPHQL_URL?.trim() ?? "";
  if (!currentUrl) return;
  const raw = await readContentJson<unknown>(ACCESS_LIST_PATH, { ref: ACCESS_LIST_BRANCH }).catch(() => null);
  const saved = raw && typeof raw === "object" ? (raw as { ssoPortals?: unknown }) : {};
  const current = await loadAccessList();
  const ssoPortals = portalBucketsAfterLeaving(saved, currentUrl, nextUrl, current);
  if (!ssoPortals) return;
  await writeContentJson(
    ACCESS_LIST_PATH,
    {
      ...(raw && typeof raw === "object" ? raw : {}),
      admins: current.admins,
      editors: current.editors,
      clients: current.clients,
      defaultRole: current.defaultRole,
      ssoPortals,
    },
    {
      branch: ACCESS_LIST_BRANCH,
      message: "chore(acesso): guarda a lista no SSO anterior",
    }
  );
}

/** Monta a lista nova sem apagar clients/defaultRole e sem deixar zero admins. */
export function buildAccessList(
  current: PermissionsConfig,
  input: { admins: unknown; editors: unknown },
  options?: { allowEmptyAdmins?: boolean }
): PermissionsConfig {
  const admins = exactEmails(input.admins, "Admin master");
  const editors = exactEmails(input.editors, "Editor EDI").filter((email) => !admins.includes(email));
  if (admins.length === 0 && !options?.allowEmptyAdmins) {
    throw new AccessListError("É preciso manter pelo menos um admin master.");
  }
  return {
    admins,
    editors,
    clients: current.clients,
    defaultRole: current.defaultRole === "admin" ? "client" : current.defaultRole,
  };
}

/** Arquivo salvo, se válido. Senão a variável de bootstrap, senão o padrão do código. */
export async function loadAccessList(): Promise<PermissionsConfig> {
  const bootstrap = getPermissionsConfig();
  try {
    const saved = await readContentJson<unknown>(ACCESS_LIST_PATH, { ref: ACCESS_LIST_BRANCH });
    if (saved && typeof saved === "object") {
      const activeUrl = (await loadStoredSsoConfig())?.url ?? process.env.FUNCIONAL_SSO_GRAPHQL_URL?.trim() ?? null;
      const picked = pickPortalList(saved as { admins?: unknown; editors?: unknown; ssoPortals?: unknown }, activeUrl);
      const source = picked ?? saved;
      const next = buildAccessList(
        getPermissionsConfig(),
        {
          admins: (source as { admins?: unknown }).admins ?? [],
          editors: (source as { editors?: unknown }).editors ?? [],
        },
        { allowEmptyAdmins: picked !== null }
      );
      const clients = (saved as { clients?: unknown }).clients;
      return {
        ...next,
        clients: Array.isArray(clients) ? clients.filter((item) => typeof item === "string") : next.clients,
      };
    }
  } catch (error) {
    if (error instanceof AccessListError) {
      console.warn("[permissions] lista salva inválida — usando a variável de bootstrap.");
    }
  }
  if (env.isProduction) {
    return { ...bootstrap, admins: [], editors: [] };
  }
  return bootstrap;
}

export async function saveAccessList(
  input: { admins: unknown; editors: unknown },
  actorEmail?: string
): Promise<PermissionsConfig> {
  const current = await loadAccessList();
  const next = buildAccessList(current, input);
  const raw = await readContentJson<unknown>(ACCESS_LIST_PATH, { ref: ACCESS_LIST_BRANCH }).catch(() => null);
  const previousPortals = raw && typeof raw === "object" && Array.isArray((raw as { ssoPortals?: unknown }).ssoPortals)
    ? ((raw as { ssoPortals: SsoPortalAccess[] }).ssoPortals)
    : [];
  const activeUrl = (await loadStoredSsoConfig())?.url ?? process.env.FUNCIONAL_SSO_GRAPHQL_URL?.trim() ?? "";
  let ssoPortals = previousPortals;
  if (activeUrl) {
    const key = ssoPortalKey(activeUrl);
    ssoPortals = [
      ...previousPortals.filter((item) => {
        try {
          return ssoPortalKey(item.url) !== key;
        } catch {
          return true;
        }
      }),
      { url: activeUrl, admins: next.admins, editors: next.editors },
    ];
  }
  await writeContentJson(ACCESS_LIST_PATH, { ...next, ssoPortals }, {
    branch: ACCESS_LIST_BRANCH,
    message: "chore(acesso): atualiza admin master e editor EDI",
  });

  if (actorEmail) {
    const currentAll = [...current.admins, ...current.editors];
    const nextAll = [...next.admins, ...next.editors];
    const granted = nextAll.filter((email) => !currentAll.includes(email));
    const revoked = currentAll.filter((email) => !nextAll.includes(email));

    await Promise.all([
      ...granted.map((targetEmail) =>
        appendAccessAuditEvent({
          action: "access_granted",
          actorEmail,
          targetEmail,
          detail: next.admins.includes(targetEmail) ? "admin" : "editor",
        })
      ),
      ...revoked.map((targetEmail) =>
        appendAccessAuditEvent({
          action: "access_revoked",
          actorEmail,
          targetEmail,
          detail: current.admins.includes(targetEmail) ? "admin" : "editor",
        })
      ),
    ]);
  }
  return next;
}
