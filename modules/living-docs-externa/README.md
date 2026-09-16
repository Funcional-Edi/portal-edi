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
| `/manual/[slug]/playground` | Playground GraphQL (Fase 4) |

## Playground GraphQL (Fase 4)

Permite ao distribuidor logado executar, contra o gateway real do produto,
apenas as operações documentadas no `manual.json` — não é um cliente GraphQL
genérico.

```
services/playground-allowlist.ts   # parse (graphql) + valida kind/name contra o manual (sem I/O)
services/proxy-playground.ts       # carrega projeto publicado + credenciais, createToken, encaminha
app/api/.../[slug]/graphql/route.ts  # BFF: sessão logada → allowlist → proxy → JSON
ui/reader/playground-panel.tsx     # textarea MVP (query + variables) — Monaco fica para depois
```

Regras de segurança:

- O token do gateway é obtido a cada execução (mesmo fluxo de
  `connect-gateway.ts`/`sync-schema.ts`) e nunca é persistido nem devolvido
  ao cliente — só o `Authorization: Bearer` do `fetch` server-side o vê.
- Introspection (`__schema`/`__type`) e `subscription` são sempre rejeitadas,
  mesmo que estivessem por engano no `manual.json`.
- Qualquer campo raiz fora de `operations[].kind`/`operations[].name` do
  manual publicado é rejeitado com 403 antes de qualquer chamada ao gateway.

## CMS

Layout compatível com `documentacao-funcional` (ADR-0009). Seed: `content/projects/demo/`.

Conteudo real da Fase 5:

- `content/projects/im/`
- `content/projects/wholesaler/`

Migracao automatizada (legado -> portal):

```bash
npm run migrate:legacy-content -- --legacy-root ../documentacao-funcional
```

Seções Markdown: `content/projects/{slug}/sections/*.md` (etapa 2.1).

### Atualização de conteúdo e cache

Os leitores de catálogo, manual, seções e referência de API compartilham a
política de `services/content-cache.ts`:

- Backend local: leitura a cada request, inclusive em Preview/produção. Edições
  nos arquivos não exigem apagar `.next`. `React.cache` apenas deduplica dentro
  da mesma renderização; recarregue a página para buscar os dados atualizados.
- Backend GitHub: cache com revalidação de 60 segundos, tags de invalidação e
  chave separada por repositório e commit do deploy Vercel. Após o intervalo,
  a primeira requisição pode receber o valor anterior enquanto ele é renovado.
- `published: false` continua ocultando o projeto e suas seções no leitor.
  A correção de cache não publica rascunhos.

Credenciais do gateway (login/senha) ficam cifradas (AES-256-GCM, chave
derivada de `AUTH_SECRET`) em `data/projects/{slug}/credentials.enc`
(gitignored). Nunca chegam ao browser após a gravação — ver
`services/gateway-credentials.ts` e `services/connect-gateway.ts`.

URLs de gateway passam por validação anti-SSRF antes de qualquer `fetch`
(`core/security/gateway-url.ts`): bloqueia IPs privados/loopback, exige
`https` e aceita allowlist opcional via `GATEWAY_URL_ALLOWED_HOSTS`.

Mapa de migração: [`docs/migracao/mapa-documentacao-funcional.md`](../../docs/migracao/mapa-documentacao-funcional.md).
