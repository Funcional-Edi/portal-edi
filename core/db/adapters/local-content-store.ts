import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { getContentRoot } from "@/core/config/env";
import type { DataCapability } from "@/core/db";
import type { DataStore } from "@/core/db";

function resolvePath(relativePath: string): string {
  return path.join(getContentRoot(), relativePath);
}

/** Lê JSON do filesystem local (dev, testes, CI). */
export async function readLocalJson<T>(relativePath: string): Promise<T | null> {
  try {
    const raw = await readFile(resolvePath(relativePath), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Lê texto puro do filesystem local (ex.: sections/*.md). */
export async function readLocalText(relativePath: string): Promise<string | null> {
  try {
    return await readFile(resolvePath(relativePath), "utf8");
  } catch {
    return null;
  }
}

/** Lista subpastas imediatas de um diretório relativo. */
export async function listLocalSubdirs(relativeDir: string): Promise<string[]> {
  const fullDir = resolvePath(relativeDir);
  try {
    const entries = await readdir(fullDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

/** Lista nomes de arquivos (não pastas) em um diretório relativo. */
export async function listLocalFiles(relativeDir: string): Promise<string[]> {
  const fullDir = resolvePath(relativeDir);
  try {
    const entries = await readdir(fullDir, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => e.name);
  } catch {
    return [];
  }
}

export const localContentStore: DataStore = {
  kind: "local-filesystem",
  capabilities: new Set<DataCapability>(["content"]),
};
