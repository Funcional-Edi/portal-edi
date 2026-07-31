import { Octokit } from "@octokit/rest";

import type { DataCapability, DataStore } from "@/core/db";

type GithubFileContent = {
  type: "file";
  content?: string;
  encoding?: string;
};

type GithubDirectoryEntry = {
  type: "file" | "dir" | "submodule" | "symlink";
  name: string;
};

type GithubContentResponse = GithubFileContent | GithubDirectoryEntry[];

let octokitClient: Octokit | null = null;

function normalizePath(relativePath: string): string {
  return relativePath.replace(/^\/+/, "");
}

function getGithubConfig(): { owner: string; repo: string; token: string } {
  const owner = process.env.GITHUB_REPO_OWNER?.trim();
  const repo = process.env.GITHUB_REPO_NAME?.trim();
  const token = process.env.GITHUB_TOKEN?.trim();

  if (!owner || !repo || !token) {
    throw new Error("GitHub CMS não configurado: faltam GITHUB_REPO_OWNER/NAME/TOKEN.");
  }

  return { owner, repo, token };
}

function getOctokitClient(): Octokit {
  if (octokitClient) return octokitClient;
  octokitClient = new Octokit({ auth: getGithubConfig().token });
  return octokitClient;
}

async function getGithubContent(path: string): Promise<GithubContentResponse | null> {
  try {
    const { owner, repo } = getGithubConfig();
    const response = await getOctokitClient().repos.getContent({
      owner,
      repo,
      path: normalizePath(path),
    });

    return response.data as GithubContentResponse;
  } catch {
    return null;
  }
}

function decodeGithubBase64(encoded: string): string {
  return Buffer.from(encoded.replace(/\n/g, ""), "base64").toString("utf8");
}

/** Lê texto puro do repositório GitHub (CMS remoto). */
export async function readGithubText(relativePath: string): Promise<string | null> {
  const content = await getGithubContent(relativePath);
  if (!content || Array.isArray(content) || content.type !== "file" || !content.content) {
    return null;
  }

  const encoding = content.encoding ?? "base64";
  if (encoding !== "base64") return null;

  return decodeGithubBase64(content.content);
}

/** Lê JSON do repositório GitHub (CMS remoto). */
export async function readGithubJson<T>(relativePath: string): Promise<T | null> {
  const raw = await readGithubText(relativePath);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Lista subpastas imediatas de um diretório relativo no GitHub. */
export async function listGithubSubdirs(relativeDir: string): Promise<string[]> {
  const content = await getGithubContent(relativeDir);
  if (!Array.isArray(content)) return [];

  return content.filter((entry) => entry.type === "dir").map((entry) => entry.name);
}

/** Lista nomes de arquivos (não pastas) em um diretório relativo no GitHub. */
export async function listGithubFiles(relativeDir: string): Promise<string[]> {
  const content = await getGithubContent(relativeDir);
  if (!Array.isArray(content)) return [];

  return content.filter((entry) => entry.type === "file").map((entry) => entry.name);
}

export const githubContentStore: DataStore = {
  kind: "github-content",
  capabilities: new Set<DataCapability>(["content"]),
};
