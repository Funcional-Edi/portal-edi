import { readContentJson, writeContentJson } from "@/core/db/adapters";
import { getPermissionsConfig } from "@/core/auth/permissions-config";
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

/** Monta a lista nova sem apagar clients/defaultRole e sem deixar zero admins. */
export function buildAccessList(
  current: PermissionsConfig,
  input: { admins: unknown; editors: unknown }
): PermissionsConfig {
  const admins = exactEmails(input.admins, "Admin master");
  const editors = exactEmails(input.editors, "Editor EDI").filter((email) => !admins.includes(email));
  if (admins.length === 0) {
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
  try {
    const saved = await readContentJson<unknown>(ACCESS_LIST_PATH, { ref: ACCESS_LIST_BRANCH });
    if (saved && typeof saved === "object") {
      const next = buildAccessList(getPermissionsConfig(), {
        admins: (saved as { admins?: unknown }).admins,
        editors: (saved as { editors?: unknown }).editors,
      });
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
  return getPermissionsConfig();
}

export async function saveAccessList(input: { admins: unknown; editors: unknown }): Promise<PermissionsConfig> {
  const next = buildAccessList(await loadAccessList(), input);
  await writeContentJson(ACCESS_LIST_PATH, next, {
    branch: ACCESS_LIST_BRANCH,
    message: "chore(acesso): atualiza admin master e editor EDI",
  });
  return next;
}
