import { readContentJson, writeContentJson } from "@/core/db/adapters";

const FIRST_ACCESS_PATH = "data/access/first-access.json";
const FIRST_ACCESS_BRANCH = "portal-state";

export type FirstAccessMap = Record<string, string>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function loadFirstAccessMap(): Promise<FirstAccessMap> {
  const data = await readContentJson<unknown>(FIRST_ACCESS_PATH, { ref: FIRST_ACCESS_BRANCH });
  if (!data || typeof data !== "object") return {};

  const out: FirstAccessMap = {};
  for (const [email, value] of Object.entries(data)) {
    if (typeof value === "string" && value.trim()) out[normalizeEmail(email)] = value;
  }
  return out;
}

export async function markFirstAccess(email: string, occurredAt = new Date().toISOString()): Promise<void> {
  const normalized = normalizeEmail(email);
  const map = await loadFirstAccessMap();
  if (map[normalized]) return;

  map[normalized] = occurredAt;
  await writeContentJson(FIRST_ACCESS_PATH, map, {
    branch: FIRST_ACCESS_BRANCH,
    message: "chore(acesso): registra primeiro acesso",
  });
}
