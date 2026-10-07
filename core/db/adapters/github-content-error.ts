/** Erros tipados e políticas (allowlist de paths, branch) da escrita no GitHub CMS. */

export type GithubContentErrorCode =
  | "NOT_CONFIGURED"
  | "PATH_FORBIDDEN"
  | "BRANCH_FORBIDDEN"
  | "BRANCH_REQUIRED"
  | "CONFLICT"
  | "UPSTREAM";

export class GithubContentError extends Error {
  constructor(
    readonly code: GithubContentErrorCode,
    message: string
  ) {
    super(message);
    this.name = "GithubContentError";
  }
}

/** Só estes prefixos podem ser gravados pelo portal. data/projects/** (schema, credentials) fica fora. */
const WRITABLE_PREFIXES = ["content/", "data/radar/", "data/access/"] as const;
const PROTECTED_BRANCHES = new Set(["main", "master"]);

/** Normaliza e valida o path; lança PATH_FORBIDDEN. Retorna o path canônico. */
export function assertWritablePath(relativePath: string): string {
  const path = relativePath.trim().replace(/^\/+/, "");
  const segments = path.split("/");
  const invalid =
    !path ||
    path.includes("\\") ||
    path.includes("\0") ||
    segments.some((s) => s === "" || s === "." || s === "..") ||
    !WRITABLE_PREFIXES.some((prefix) => path.startsWith(prefix));
  if (invalid) {
    throw new GithubContentError("PATH_FORBIDDEN", "Path fora da allowlist de escrita do CMS.");
  }
  return path;
}

/** Exige branch explícita e recusa main/master. Retorna o nome normalizado. */
export function assertWritableBranch(branch: string | undefined): string {
  const name = branch?.trim();
  if (!name) {
    throw new GithubContentError("BRANCH_REQUIRED", "Escrita no GitHub exige branch explícita.");
  }
  if (PROTECTED_BRANCHES.has(name.toLowerCase().replace(/^refs\/heads\//, ""))) {
    throw new GithubContentError("BRANCH_FORBIDDEN", "Escrita direta em main/master é proibida.");
  }
  return name.replace(/^refs\/heads\//, "");
}

/** Mensagem de commit sem quebras/controle e com tamanho limitado. */
export function sanitizeCommitMessage(message: string | undefined): string {
  // eslint-disable-next-line no-control-regex
  const clean = (message ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, 200);
  return clean || "chore(cms): atualiza conteúdo via portal";
}
