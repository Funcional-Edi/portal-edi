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

## Fluxo planejado para escrita controlada

O portal não deve fazer `git push` diretamente na branch de produção nem gravar
credenciais no conteúdo. Quando a edição administrativa precisar persistir no
GitHub, o fluxo deverá ser:

1. O administrador salva uma alteração autenticada no portal.
2. O servidor valida o payload com os schemas do módulo e cria uma branch de
   trabalho isolada.
3. O adapter GitHub grava somente os arquivos permitidos nessa branch, usando a
   API de Contents/commits e o SHA atual para detectar conflito.
4. O servidor abre um Pull Request com resumo, autor, ambiente e validações
   executadas; a branch protegida não recebe escrita direta.
5. CI e os responsáveis pelo repositório validam e aprovam o PR. O merge é a
   operação que promove o conteúdo versionado.
6. O deploy de homologação ou produção ocorre conforme a política do repositório
   e atualiza o conteúdo lido pelo portal.

Enquanto essa etapa não existir, `GITHUB_TOKEN` deve permanecer com permissão de
leitura. A implementação futura precisa separar token de leitura e token de
escrita, limitar caminhos permitidos, registrar o PR retornado e tratar conflitos
de SHA/rebase sem sobrescrever alterações de outro administrador.

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
