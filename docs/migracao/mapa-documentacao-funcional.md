# Mapa ponta a ponta — `documentacao-funcional` → `portal-integracao`

> **Objetivo:** migrar a proposta de **documentação viva** (manuais GraphQL curados por
> produto) para a arquitetura modular do Portal de Integração, com regras enforçadas
> por CI e convenções de código explícitas.
>
> **Referência legada:** `../documentacao-funcional/HANDOFF-MESTRE.md` (jul/2026)
> **Módulo destino:** `modules/living-docs-externa` (rota base `/manual`)

---

## 1. Proposta de negócio (paridade)

| Capacidade | Portal antigo | Portal novo | Fase |
|------------|---------------|-------------|------|
| Catálogo de manuais publicados | `/manual` | `/manual` | 1 ✅ |
| Roteiro numerado por produto | `/manual/[slug]` | `/manual/[slug]` | 1 ✅ |
| Detalhe de operação GraphQL | `/manual/.../operations/[kind]/[name]` | idem | 1 ✅ |
| Playground filtrado (allowlist) | `/manual/[slug]/playground` | idem | 4 |
| Admin: listar/criar projetos | `/admin/projects` | `/admin/projects` | 3 |
| Conectar gateway (createToken) | `POST .../connect` | idem | 3 |
| Sync schema (introspection) | `POST .../sync` | idem | 3 |
| Curadoria / editor de manual | `/admin/projects/[slug]/edit` | idem | 3–6 |
| Publicar (`published: true`) | toggle admin | idem | 3 |
| CMS em arquivos (GitHub/local) | `content/` + `data/` | idem (ADR-0009) | 1 ✅ |
| Credenciais gateway criptografadas | `credentials.enc` | idem | 3 |
| SSO distribuidor | provider `sso` | `core/auth` ✅ | — |
| Rate limit login | `lib/auth/login-rate-limit` | `core/auth/rate-limit` ✅ | — |
| Referência GraphQL global | `/docs/api` | ✅ Fase 11 | 11 |
| Clientes legados (`clients.json`) | `/admin/clients` | **deprecado** | — |
| Métricas / notificações | `/admin/metrics` | **fora do MVP** | 8+ |
| Export Postman/Insomnia | APIs export | `/export/postman`, `/export/insomnia` | 8–10 ✅ |
| Editor BPMN / fluxogramas | `integrationFlow` | módulo `fluxogramas` | 7 ✅ |
| WYSIWYG unificado | `components/admin/wysiwyg` | Fase 6 | 6 |

**Regra de ouro (mantida):** SSO abre o portal; Gateway alimenta os manuais; **nunca**
inverter URLs nem expor token master ao browser.

---

## 2. Melhorias estruturais (antigo → novo)

| Antigo | Problema | Novo | Benefício |
|--------|----------|------|-----------|
| `lib/` monolítico (~15 pastas) | Domínio espalhado, difícil testar | `modules/living-docs-externa/{schema,repository,services,ui}` | Bounded context isolado |
| `components/` global | Acoplamento entre admin e leitor | `modules/.../ui/{reader,admin}` | Fronteiras claras |
| Lógica em `route.ts` | Não testável | Route fina → `services/` | Vitest unitário |
| Regras só no README | Apodrece com prazo | `dependency-cruiser` + ADRs | CI quebra build |
| Dois editores (legacy + WYSIWYG) | Dívida técnica | Um editor canônico (Fase 6) | Menos manutenção |
| `app/` mistura tudo | Sem camadas | `app → modules → core` | Arquitetura enforçada |
| `lib/projects/store.ts` cache + GitHub + local | God module | `core/db/adapters` + `repository/` | Adapter plugável |
| Permissões hardcoded no middleware edge | Parcial | `core/auth/roles` + module-registry RBAC | Fonte única |

---

## 3. Mapa de código — `lib/` → módulo novo

### 3.1 Domínio principal (`lib/projects/` → `modules/living-docs-externa/`)

| Arquivo legado | Destino | Camada |
|----------------|---------|--------|
| `types.ts` | `schema/project.ts`, `schema/manual.ts` | schema |
| `store.ts`, `local-store.ts` | `repository/project-repository.ts` | repository |
| `connect.ts`, `sync-schema.ts` | `services/connect-gateway.ts`, `services/sync-schema.ts` | services |
| `manual-generator.ts`, `manual-quality.ts` | `services/manual-generator.ts`, `services/manual-quality.ts` | services |
| `allowlist.ts`, `playground-token.ts` | `services/playground-allowlist.ts` | services |
| `credentials.ts` | `services/gateway-credentials.ts` (+ `core/config` secret) | services |
| `sections.ts` | `repository/section-repository.ts` | repository |
| `schema-diff.ts`, `schema-monitor.ts` | `services/schema-monitor.ts` | services |
| `postman-export.ts`, `insomnia-export.ts` | Fase 8 (export) | — |
| `integration-flow-*` | módulo `fluxogramas` (Fase 7+) | — |
| `cache-config.ts` | `services/cache-tags.ts` (Next `unstable_cache`) | services |

### 3.2 Infra compartilhada (`lib/` → `core/`)

| Arquivo legado | Destino | Status |
|----------------|---------|--------|
| `lib/auth/*` | `core/auth/*` | ✅ Feito |
| `lib/github/client.ts`, `content.ts` | `core/db/adapters/github-content-store.ts` | Fase 2 |
| `lib/security/gateway-url.ts` | `core/security/gateway-url.ts` | Fase 3 |
| `lib/cms/*` (guias transversais) | `modules/manuais-internos` ou Fase 8 | Planejado |
| `lib/graphql/*` (referência global) | Fora do MVP | — |
| `lib/search/*` | Fase 8 | — |
| `lib/metrics/*`, `lib/notifications/*` | Fase 8 | — |

### 3.3 UI (`components/` → `modules/living-docs-externa/ui/`)

| Pasta legada | Destino | Fase |
|--------------|---------|------|
| `components/projects/*` | `ui/reader/*` | 1–2 |
| `components/admin/*`, `wysiwyg/*` | `ui/admin/*` | 3–6 |
| `components/portal/*` | `ui/shell/*` | 1 |
| `components/playground/*` | `ui/reader/playground/*` | 4 |
| `components/ui/*` | `ui/primitives/*` (ou shared futuro) | 1 |
| `components/docs/*`, `graphql/*` | Fora do MVP | 8+ |

---

## 4. Mapa de rotas (páginas)

### 4.1 Distribuidor (SSO / client)

| Rota legada | Rota nova | Componente | Fase |
|-------------|-----------|------------|------|
| `/manual` | `/manual` | `ui/reader/manual-catalog.tsx` | 1 ✅ |
| `/manual/[slug]` | `/manual/[slug]` | `ui/reader/manual-roteiro.tsx` | 1 ✅ |
| `/manual/[slug]/operations/[kind]/[name]` | idem | `ui/reader/operation-detail.tsx` | 1 ✅ |
| `/manual/[slug]/playground` | idem | `ui/reader/playground-panel.tsx` | 4 |
| `/projects/*` | redirect 308 → `/manual/*` | `middleware.ts` | 2 |
| `/fluxogramas` | `/fluxogramas` | `ui/flow-catalog.tsx` | 7 ✅ |
| `/fluxogramas/[slug]` | idem | `ui/flow-viewer.tsx` | 7 ✅ |

### 4.2 Admin (EDI)

| Rota legada | Rota nova | Fase |
|-------------|-----------|------|
| `/admin/projects` | `/admin/projects` | 3 |
| `/admin/projects/new` | idem | 3 |
| `/admin/projects/[slug]` | idem | 3 |
| `/admin/projects/[slug]/edit` | idem (editor canônico) | 3–6 |
| `/admin/projects/[slug]/flow` | idem | 7 ✅ |
| `/admin/projects/[slug]/curate` | **removido** (redireciona p/ edit) | — |
| `/admin/clients/*` | **não migrar** (SSO substitui) | — |
| `/admin/docs/*` | Fase 8 ou `manuais-internos` | 8+ |

### 4.3 Auth / público

| Rota legada | Rota nova | Status |
|-------------|-----------|--------|
| `/login` | `/login` | Fase 1 ✅ |
| `/` | `/` | ✅ landing (planta viva) |
| `/api/health` | `/api/health` | ✅ |

---

## 5. Mapa de APIs BFF

Rotas finas em `app/api/` — lógica em `modules/living-docs-externa/services/`.

| API legada | API nova | Service | Fase |
|------------|----------|---------|------|
| `GET /api/projects` | `GET /api/living-docs/projects` | `list-projects` | 3 |
| `POST /api/projects` | idem | `create-project` | 3 |
| `GET /api/projects/[slug]` | idem | `get-project` | 2 |
| `POST .../connect` | idem | `connect-gateway` | 3 |
| `POST .../sync` | idem | `sync-schema` | 3 |
| `GET|PUT .../manual` | idem | `get-manual`, `update-manual` | 3 |
| `POST .../graphql` | idem | `proxy-playground` | 4 |
| `GET|PUT .../sections` | idem | `section-repository` | 3 |
| `.../export/*` | `GET /export/postman|insomnia|pdf` | `export-*` | 8–10 ✅ |
| `GET /api/content` (guias) | Fora do MVP | — | — |
| `POST /api/graphql` (global) | **não migrar** | — | — |

---

## 6. Modelo de dados (CMS — compatível)

Layout **mantido** para facilitar cópia de conteúdo do portal antigo:

```
content/
  projects/{slug}/
    config.json       # ProjectConfig (Zod)
    manual.json       # IntegrationManual (Zod)
    sections/*.md     # blocos Markdown
    assets/           # imagens
data/
  projects/{slug}/
    schema.json       # introspection snapshot
    changelog.json
    credentials.enc   # gitignored — token AES-256-GCM
  permissions.json    # admins (futuro: core/auth)
```

Schemas portados para `modules/living-docs-externa/schema/` (paridade com
`lib/projects/types.ts` do legado).

---

## 7. Regras de código (novo projeto)

1. **Dependência:** `app → modules → core` — validado por `npm run arch`.
2. **Services:** sem import de React/Next; retornam tipos Zod ou domain types.
3. **Repository:** I/O apenas (filesystem/GitHub); sem regra de negócio.
4. **UI:** componentes em `modules/.../ui/`; páginas em `app/` só compõem.
5. **Testes:** `*.test.ts` ao lado de services e schemas críticos.
6. **Segredos:** token gateway nunca no browser; proxy server-side only.
7. **Publicação:** distribuidor só vê `published: true`.
8. **Eventos:** sync/publicação pode emitir `core/events` (Fase 3+).

---

## 8. Variáveis de ambiente (migração)

| Variável legada | Variável nova | Uso |
|-----------------|---------------|-----|
| — | `CONTENT_ROOT` | Raiz do CMS (default: cwd) |
| `GITHUB_*` / Octokit | `GITHUB_REPO_*` (ADR-0009) | CMS produção |
| `FUNCIONAL_SSO_GRAPHQL_URL` | idem | SSO ✅ |
| `AUTH_SECRET` | idem | sessão ✅ |
| `DEV_AUTH_ENABLED` | idem | login dev ✅ |
| `KV_REST_*` | idem | rate limit ✅ |

---

## 9. Conteúdo seed (migração de dados)

| Projeto legado | Ação | Prioridade |
|----------------|------|------------|
| `im` | Copiar para validar roteiro curto (2 ops) | Alta |
| `wholesaler` | Copiar após IM validado (15 ops) | Média |
| `canal-autorizador` | Seed template BPMN em `content/projects/canal-autorizador/` | ✅ Fase 7 |
| Projetos `e2e-*`, `teste*` | **Não migrar** | — |

Seed local incluído: `content/projects/demo/` (desenvolvimento e testes).

---

## 10. Checklist por fase

Ver [`cronograma.md`](./cronograma.md) para datas e entregáveis detalhados.

- [x] **Fase 0** — Mapa + ADR-0009 + cronograma
- [x] **Fase 1** — Schemas, adapter local, catálogo + roteiro + operação
- [x] **Fase 2** — Seções Markdown, redirect legado, shell navegação completo
- [x] **Fase 3** — Admin CRUD projetos, connect, sync, publicar
- [x] **Fase 4** — Playground + proxy GraphQL + allowlist
- [x] **Fase 5** — Migrar conteúdo real (IM, wholesaler) + E2E Playwright
- [x] **Fase 6** — Editor Markdown canônico (sem lib WYSIWYG — ver cronograma §6)
- [x] **Fase 7** — Fluxogramas BPMN (`modules/fluxogramas`) ✅
- [x] **Fase 8** — Export, métricas, busca, guias transversais ✅
- [x] **Fase 9** — Consolidação homolog (RBAC por arquivo, smoke, deploy) ✅
- [x] **Fase 10** — Polish pós-MVP sem banco (PDF, E2E allowlist, validações) ✅

### Pendências fora das fases

- [x] Smoke SSO homolog — [`fase-5-smoke-sso-homolog.md`](./fase-5-smoke-sso-homolog.md) (automação + passos manuais)
- [x] `canal-autorizador` marcado como **seed-only** até migração real do legado

---

## 11. Referências

- Legado: `documentacao-funcional/HANDOFF-MESTRE.md` §7–13
- ADRs: `docs/arquitetura/adr/0001`, `0002`, `0003`, `0009`
- Módulo: `modules/living-docs-externa/README.md`
- Mapa geral: `docs/estrutura/mapa-projeto.md`
- Cofre Obsidian (navegação + estudos): `obsidian/COMO-USAR.md`
