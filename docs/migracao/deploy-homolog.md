# Deploy homolog — Portal de Integração

Guia mínimo para subir o portal em ambiente de homologação.

## Pré-requisitos

- Node **20.x** ou Docker
- Variáveis em `.env.local` (copie de `.env.example`)

| Variável | Obrigatória | Para quê |
|----------|-------------|----------|
| `AUTH_SECRET` | Sim | Sessão JWT + criptografia de credenciais gateway |
| `AUTH_URL` | Sim | URL pública do portal (ex.: `https://portal-homolog...`) |
| `FUNCIONAL_SSO_GRAPHQL_URL` | Sim (homolog) | Login SSO distribuidor/admin |
| `GITHUB_REPO_*` + `GITHUB_TOKEN` | Opcional | CMS remoto (senão usa `content/` local na imagem) |

## RBAC (Fase B)

```bash
cp data/permissions.example.json data/permissions.json
# Edite admins/clients — arquivo é gitignored
```

## Node direto

```bash
npm ci
npm run build
npm run start    # porta 3002
```

## Docker

```bash
docker build -t portal-integracao .
docker run -p 3002:3002 --env-file .env.local portal-integracao
```

Monte `data/permissions.json` via volume se precisar alterar RBAC sem rebuild:

```bash
docker run -p 3002:3002 --env-file .env.local \
  -v "$(pwd)/data/permissions.json:/app/data/permissions.json:ro" \
  portal-integracao
```

## Smoke pós-deploy

```bash
curl -s http://localhost:3002/api/health | jq
npm run smoke:homolog
```

Checklist manual SSO: [`fase-5-smoke-sso-homolog.md`](./fase-5-smoke-sso-homolog.md).

CMS GitHub em staging: [`github-cms-staging.md`](./github-cms-staging.md).

## Health check

`GET /api/health` retorna:

- `status`: `ok` ou `degraded` (problemas de env)
- `content.backend`: `local` | `github`
- `rbac.permissionsSource`: `file` | `default`
- `summary`: contagem de módulos ativos vs bloqueados
- `blockedModules`: módulos que exigem banco (homologação, IA)

Use como probe de readiness em Kubernetes/load balancer.
