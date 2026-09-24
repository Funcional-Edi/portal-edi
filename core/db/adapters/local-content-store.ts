import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { getContentRoot } from "@/core/config/env";

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

/** Grava JSON no filesystem local (cria pastas intermediárias se necessário). */
export async function writeLocalJson(relativePath: string, data: unknown): Promise<void> {
  const fullPath = resolvePath(relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/** Grava texto puro no filesystem local (ex.: sections/*.md). */
export async function writeLocalText(relativePath: string, content: string): Promise<void> {
  const fullPath = resolvePath(relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf8");
}

/** Remove um arquivo. Retorna false se ele não existia. */
export async function deleteLocalFile(relativePath: string): Promise<boolean> {
  const fullPath = resolvePath(relativePath);
  try {
    await rm(fullPath);
    return true;
  } catch {
    return false;
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
