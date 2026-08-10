# GitHub CMS — staging / homolog (ADR-0009)

Como apontar o portal para conteúdo versionado no GitHub em vez do filesystem local.

## Quando usar

| Ambiente | Backend recomendado |
|----------|---------------------|
| Dev local | `local` (default — pastas `content/` e `data/` no repo) |
| Homolog / prod | `github` — conteúdo centralizado, deploy stateless |

Seleção automática em `core/db/adapters/index.ts`: se `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` e `GITHUB_TOKEN` estiverem definidos, leituras usam Octokit.

## Variáveis

```env
GITHUB_REPO_OWNER=Funcional-Edi
GITHUB_REPO_NAME=portal-edi-content    # repo só com content/ + data/ (ou monorepo)
GITHUB_TOKEN=ghp_...                   # fine-grained: Contents read (write na Fase 3+ remota)
# CONTENT_ROOT=/app                    # opcional; paths relativos ao root do CMS no repo
```

## Layout esperado no repo CMS

Igual ao legado (paridade ADR-0009):

```text
content/projects/{slug}/config.json
content/projects/{slug}/manual.json
content/projects/{slug}/sections/*.md
data/projects/{slug}/schema.json
data/projects/{slug}/credentials.enc   # nunca no Git — só runtime/secrets
```

## Limitações atuais

- **Leitura** remota: implementada (`readGithubJson`, `readGithubText`).
- **Escrita** remota (admin connect/sync/edit): ainda lança erro — homolog EDI usa backend local ou aguarda Fase futura de write GitHub.
- Cache: services usam `unstable_cache` + tags (`LIVING_DOCS_CACHE_TAGS`); após publish local, `revalidateTag` invalida. Em GitHub puro, TTL do cache prevalece até redeploy ou tag manual.

## Validar configuração

```bash
# Com GITHUB_* no .env.local:
npm run smoke:homolog
curl -s http://localhost:3002/api/health | jq '.content'
# Esperado: { "backend": "github", "githubConfigured": true }
```

## Staging típico

1. Branch `content/homolog` no repo CMS com projetos `im`, `demo` publicados.
2. Token de leitura no secret manager do deploy.
3. `AUTH_SECRET` + SSO homolog no `.env` do runtime.
4. Smoke SSO após deploy (ver `fase-5-smoke-sso-homolog.md`).
