import type { ContentBackend } from "@/core/db/adapters/content-paths";
import {
  listGithubFiles,
  listGithubSubdirs,
  readGithubJson,
  readGithubText,
  githubContentStore,
} from "@/core/db/adapters/github-content-store";
import {
  listLocalFiles,
  listLocalSubdirs,
  readLocalJson,
  readLocalText,
  localContentStore,
  writeLocalJson,
} from "@/core/db/adapters/local-content-store";
import type { DataStore } from "@/core/db";

/** Seleciona backend de conteúdo conforme variáveis GITHUB_*. */
export function getContentBackend(): ContentBackend {
  const owner = process.env.GITHUB_REPO_OWNER?.trim();
  const repo = process.env.GITHUB_REPO_NAME?.trim();
  const token = process.env.GITHUB_TOKEN?.trim();
  if (owner && repo && token) return "github";
  return "local";
}

export function isGitHubContentConfigured(): boolean {
  return getContentBackend() === "github";
}

/** Porta única para repositories: local em dev/teste, GitHub quando configurado. */
export async function readContentJson<T>(relativePath: string): Promise<T | null> {
  if (getContentBackend() === "github") return readGithubJson<T>(relativePath);
  return readLocalJson<T>(relativePath);
}

/** Porta única para leitura de Markdown/texto. */
export async function readContentText(relativePath: string): Promise<string | null> {
  if (getContentBackend() === "github") return readGithubText(relativePath);
  return readLocalText(relativePath);
}

/** Porta única para listar subdiretórios imediatos. */
export async function listContentSubdirs(relativeDir: string): Promise<string[]> {
  if (getContentBackend() === "github") return listGithubSubdirs(relativeDir);
  return listLocalSubdirs(relativeDir);
}

/** Porta única para listar arquivos imediatos. */
export async function listContentFiles(relativeDir: string): Promise<string[]> {
  if (getContentBackend() === "github") return listGithubFiles(relativeDir);
  return listLocalFiles(relativeDir);
}

/** Porta única para gravar JSON. Escrita remota (GitHub) entra na Fase 3+. */
export async function writeContentJson(relativePath: string, data: unknown): Promise<void> {
  if (getContentBackend() === "github") {
    throw new Error("Escrita no GitHub CMS ainda não implementada.");
  }
  return writeLocalJson(relativePath, data);
}

export function getContentStore(): DataStore {
  return getContentBackend() === "github" ? githubContentStore : localContentStore;
}
