# `living-docs-externa` — Documentação viva (clientes)

Manuais de integração GraphQL curados por produto. Substitui PDFs artesanais.

## Estrutura

```
schema/       # Zod: ProjectConfig, IntegrationManual
repository/   # I/O CMS (content/ + data/), inclui credentials-repository
services/     # Regras: listagem publicada, get manual, connect-gateway
ui/reader/    # Catálogo, roteiro, detalhe de operação
ui/admin/     # CRUD projetos, conectar gateway (3.2), sync schema (3.3), editor de operações (3.4)
```

## Rotas

| Rota | UI |
|------|-----|
| `/manual` | Catálogo |
| `/manual/[slug]` | Roteiro |
| `/manual/[slug]/operations/[kind]/[name]` | Operação |

## CMS

Layout compatível com `documentacao-funcional` (ADR-0009). Seed: `content/projects/demo/`.

Seções Markdown: `content/projects/{slug}/sections/*.md` (etapa 2.1).

Credenciais do gateway (login/senha) ficam cifradas (AES-256-GCM, chave
derivada de `AUTH_SECRET`) em `data/projects/{slug}/credentials.enc`
(gitignored). Nunca chegam ao browser após a gravação — ver
`services/gateway-credentials.ts` e `services/connect-gateway.ts`.

URLs de gateway passam por validação anti-SSRF antes de qualquer `fetch`
(`core/security/gateway-url.ts`): bloqueia IPs privados/loopback, exige
`https` e aceita allowlist opcional via `GATEWAY_URL_ALLOWED_HOSTS`.

Mapa de migração: [`docs/migracao/mapa-documentacao-funcional.md`](../../docs/migracao/mapa-documentacao-funcional.md).
