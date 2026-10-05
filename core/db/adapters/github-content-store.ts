import { Octokit } from "@octokit/rest";

import {
  assertWritableBranch,
  assertWritablePath,
  GithubContentError,
  sanitizeCommitMessage,
} from "@/core/db/adapters/github-content-error";

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

export type GithubWriteFile = { path: string; content: string };

let octokitClient: Octokit | null = null;

function normalizePath(relativePath: string): string {
  return relativePath.replace(/^\/+/, "");
}

function getGithubConfig(): { owner: string; repo: string; token: string } {
  const owner = process.env.GITHUB_REPO_OWNER?.trim();
  const repo = process.env.GITHUB_REPO_NAME?.trim();
  const token = process.env.GITHUB_TOKEN?.trim();

  if (!owner || !repo || !token) {
    throw new GithubContentError(
      "NOT_CONFIGURED",
      "GitHub CMS não configurado: faltam GITHUB_REPO_OWNER/NAME/TOKEN."
    );
  }

  return { owner, repo, token };
}

function getOctokitClient(): Octokit {
  if (octokitClient) return octokitClient;
  octokitClient = new Octokit({ auth: getGithubConfig().token });
  return octokitClient;
}

async function getGithubContent(
  path: string,
  ref?: string
): Promise<GithubContentResponse | null> {
  try {
    const { owner, repo } = getGithubConfig();
    const response = await getOctokitClient().repos.getContent({
      owner,
      repo,
      path: normalizePath(path),
      ...(ref ? { ref } : {}),
    });

    return response.data as GithubContentResponse;
  } catch {
    return null;
  }
}

function decodeGithubBase64(encoded: string): string {
  return Buffer.from(encoded.replace(/\n/g, ""), "base64").toString("utf8");
}

/** Lê texto puro do repositório GitHub (CMS remoto). `ref` = branch ou SHA. */
export async function readGithubText(
  relativePath: string,
  ref?: string
): Promise<string | null> {
  const content = await getGithubContent(relativePath, ref);
  if (!content || Array.isArray(content) || content.type !== "file" || !content.content) {
    return null;
  }

  const encoding = content.encoding ?? "base64";
  if (encoding !== "base64") return null;

  return decodeGithubBase64(content.content);
}

/** Lê JSON do repositório GitHub (CMS remoto). */
export async function readGithubJson<T>(relativePath: string, ref?: string): Promise<T | null> {
  const raw = await readGithubText(relativePath, ref);
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

function getWriteClient(): { octokit: Octokit; owner: string; repo: string } {
  const owner = process.env.GITHUB_REPO_OWNER?.trim();
  const repo = process.env.GITHUB_REPO_NAME?.trim();
  const token = process.env.GITHUB_WRITE_TOKEN?.trim();
  if (!owner || !repo || !token) {
    throw new GithubContentError(
      "NOT_CONFIGURED",
      "Escrita no GitHub CMS não configurada: faltam GITHUB_REPO_OWNER/NAME/WRITE_TOKEN."
    );
  }
  return { octokit: new Octokit({ auth: token }), owner, repo };
}

function toUpstreamError(error: unknown): GithubContentError {
  if (error instanceof GithubContentError) return error;
  // Só o status HTTP: a mensagem do Octokit pode ecoar detalhes da requisição.
  const status = (error as { status?: number })?.status;
  return new GithubContentError("UPSTREAM", `Falha na API do GitHub${status ? ` (HTTP ${status})` : ""}.`);
}

/**
 * Um único commit com N arquivos (Git Data API). `content: null` remove o arquivo.
 * updateRef com force:false: non-fast-forward vira CONFLICT, nunca sobrescreve.
 */
export async function commitGithubFiles(input: {
  branch?: string;
  message?: string;
  files: Array<{ path: string; content: string | null }>;
}): Promise<void> {
  // Valida tudo antes de qualquer chamada de rede.
  const branch = assertWritableBranch(input.branch);
  const files = input.files.map((f) => ({ path: assertWritablePath(f.path), content: f.content }));
  if (files.length === 0) return;
  const message = sanitizeCommitMessage(input.message);

  const { octokit, owner, repo } = getWriteClient();
  try {
    const ref = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const parentSha = ref.data.object.sha;

    const entries = await Promise.all(
      files.map(async (f) => {
        if (f.content === null) {
          return { path: f.path, mode: "100644" as const, type: "blob" as const, sha: null };
        }
        const blob = await octokit.git.createBlob({
          owner,
          repo,
          content: Buffer.from(f.content, "utf8").toString("base64"),
          encoding: "base64",
        });
        return { path: f.path, mode: "100644" as const, type: "blob" as const, sha: blob.data.sha };
      })
    );

    const tree = await octokit.git.createTree({ owner, repo, base_tree: parentSha, tree: entries });
    const commit = await octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: tree.data.sha,
      parents: [parentSha],
    });

    try {
      await octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: commit.data.sha,
        force: false,
      });
    } catch (error) {
      const status = (error as { status?: number })?.status;
      if (status === 409 || status === 422) {
        throw new GithubContentError("CONFLICT", "Branch mudou durante a gravação (non-fast-forward).");
      }
      throw error;
    }
  } catch (error) {
    throw toUpstreamError(error);
  }
}

/** Commit atômico de arquivos de texto em uma branch (não-main). */
export async function writeGithubFilesAtomic(input: {
  branch?: string;
  message?: string;
  files: GithubWriteFile[];
}): Promise<void> {
  return commitGithubFiles(input);
}

/** Remove um arquivo via commit. Retorna false se ele não existe na branch. */
export async function deleteGithubFile(
  relativePath: string,
  options: { branch?: string; message?: string }
): Promise<boolean> {
  const branch = assertWritableBranch(options.branch);
  const path = assertWritablePath(relativePath);
  const existing = await getGithubContent(path, branch);
  if (!existing || Array.isArray(existing)) return false;
  await commitGithubFiles({ branch, message: options.message, files: [{ path, content: null }] });
  return true;
}
