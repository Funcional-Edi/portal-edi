import type { ContentBackend } from "@/core/db/adapters/content-paths";
import {
  deleteGithubFile,
  listGithubFiles,
  listGithubSubdirs,
  readGithubJson,
  readGithubText,
  writeGithubFilesAtomic,
} from "@/core/db/adapters/github-content-store";
import {
  deleteLocalFile,
  listLocalFiles,
  listLocalSubdirs,
  readLocalJson,
  readLocalText,
  writeLocalJson,
  writeLocalText,
} from "@/core/db/adapters/local-content-store";

export {
  GithubContentError,
  type GithubContentErrorCode,
} from "@/core/db/adapters/github-content-error";
/** `ref` (leitura) só vale no GitHub; `branch`/`message` (escrita) idem — local ignora. */
export type ContentReadOptions = { ref?: string };
export type ContentWriteOptions = { branch?: string; message?: string };

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
export async function readContentJson<T>(
  relativePath: string,
  options?: ContentReadOptions
): Promise<T | null> {
  if (getContentBackend() === "github") return readGithubJson<T>(relativePath, options?.ref);
  return readLocalJson<T>(relativePath);
}

/** Porta única para leitura de Markdown/texto. */
export async function readContentText(
  relativePath: string,
  options?: ContentReadOptions
): Promise<string | null> {
  if (getContentBackend() === "github") return readGithubText(relativePath, options?.ref);
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

/** Porta única para gravar JSON. No GitHub: commit atômico em `options.branch` (nunca main). */
export async function writeContentJson(
  relativePath: string,
  data: unknown,
  options?: ContentWriteOptions
): Promise<void> {
  if (getContentBackend() === "github") {
    return writeGithubFilesAtomic({
      ...options,
      files: [{ path: relativePath, content: `${JSON.stringify(data, null, 2)}\n` }],
    });
  }
  return writeLocalJson(relativePath, data);
}

/** Porta única para gravar Markdown/texto (`sections/*.md`). */
export async function writeContentText(
  relativePath: string,
  content: string,
  options?: ContentWriteOptions
): Promise<void> {
  if (getContentBackend() === "github") {
    return writeGithubFilesAtomic({ ...options, files: [{ path: relativePath, content }] });
  }
  return writeLocalText(relativePath, content);
}

/** Porta única para remover um arquivo de conteúdo. */
export async function deleteContentFile(
  relativePath: string,
  options?: ContentWriteOptions
): Promise<boolean> {
  if (getContentBackend() === "github") {
    return deleteGithubFile(relativePath, { branch: options?.branch, message: options?.message });
  }
  return deleteLocalFile(relativePath);
}
