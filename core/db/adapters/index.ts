import type { ContentBackend } from "@/core/db/adapters/content-paths";

/** GitHub CMS entra na Fase 2 — por ora só local. */
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
