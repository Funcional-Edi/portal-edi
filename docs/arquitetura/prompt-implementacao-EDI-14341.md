# Prompt — implementação EDI-14341 (copiar tudo abaixo para o chat)

---

Você é um dev sênior implementando a issue **EDI-14341** no repositório **Portal-Edi**. Trabalhe **somente** na branch **`edi-14341`**. Objetivo: código limpo, fluxo viável, sem over-engineering, **zero regressão** em dev local (backend `local`).

## 1. Meta da issue

**Título Jira:** Dev - Fundação escrita GitHub CMS e papéis admin master e editor EDI

Entregar **duas fundações** (sem UI de fila, sem Radar, sem e-mail, sem PR):

1. **Escrita segura no GitHub CMS** (hoje falha em `core/db/adapters/index.ts`).
2. **RBAC** com papéis `editor`, `reviewer`, `admin`, `client` — editor/revisor por **e-mail exato**, nunca por domínio.

Issues futuras ( **não implementar agora** ): EDI-14342 Radar, EDI-14335 fila, EDI-1435 histórico, etc.

## 2. Arquitetura obrigatória

- Dependências: `app → modules → core`. **Módulos não importam módulos.**
- Persistência: repositories chamam `core/db/adapters` — **não** usar Octokit direto em `modules/` ou `app/`.
- Segurança: `.cursor/rules/seguranca-dados.mdc` — tokens só server-side, nunca `NEXT_PUBLIC_*` para GitHub.
- Qualidade final: **`npm run ci`** deve passar (typecheck, lint, arch, test, build).
- Node 20.x. Estilo do repo: TypeScript estrito, Zod onde já há schema, testes Vitest com mocks.

## 3. Estado atual do código (leia antes de codar)

| Arquivo | Situação |
|---------|----------|
| `core/db/adapters/github-content-store.ts` | Só **leitura** via `repos.getContent` **sem `ref`** |
| `core/db/adapters/index.ts` | `writeContentJson/Text/deleteContentFile` lançam erro se backend `github` |
| `core/auth/roles.ts` | `UserRole = "admin" \| "client"` |
| `core/auth/permissions-config.ts` | Schema só `admins`, `clients`, `defaultRole` |
| `data/permissions.example.json` | Sem editors/reviewers |
| `core/auth/module-access.ts` | `/admin` e `access: "admin"` só `role === "admin"` |
| ~30 rotas `app/api/living-docs/**` | `requireAdmin()` + `isAdminRole` |
| `modules/compliance/data/controls.ts` | Catálogo — **adicionar** controles novos |

Referências: `docs/arquitetura/adr/0009-content-cms-adapter.md`, `docs/migracao/github-cms-staging.md`, `docs/arquitetura/jira-demandas-fila-e-radar.md` (B1).

## 4. Parte A — Escrita GitHub (detalhe técnico)

### 4.1 API preferida

Implementar escrita **atômica** com **Git Data API** (não depender de N chamadas `createOrUpdateFileContents` soltas):

Fluxo por operação de escrita:

1. Validar **todos** os paths (allowlist) antes de chamar GitHub.
2. Obter `ref` da branch alvo → commit SHA da ponta.
3. Para cada arquivo: `createBlob` (base64).
4. `createTree` com base_tree = SHA do commit pai (modo `100644`).
5. `createCommit` com mensagem sanitizada.
6. `updateRef` na branch (com `force: false`); se rejeitado por non-fast-forward → erro **CONFLICT**.

Exportar função de alto nível, ex.:

`writeGithubFilesAtomic(input: { branch: string; message: string; files: Array<{ path: string; content: string }> })`

E integrar em `writeContentJson` / `writeContentText` / `deleteContentFile` **somente quando** for necessário expor via portas — para delete, implementar remoção no tree (conteúdo ausente no novo tree) **ou** deixar delete explícito documentado se YAGNI: **implementar delete atômico** se `deleteContentFile` já é porta pública usada em produção local.

### 4.2 Allowlist de caminhos (obrigatório — bloquear no adapter)

Normalizar path: trim, barras `/`, sem `\`, sem prefixo `/`, sem segmentos `..`, sem `:` (Windows).

**Permitido:**

- Prefixo `content/` (ex.: `content/projects/demo/manual.json`, `content/products/x/config.json`)
- Prefixo `data/radar/` (estado operacional futuro do Radar)

**Proibido (sempre rejeitar):**

- Qualquer coisa fora dos dois prefixos
- `data/projects/**` (inclui `schema.json`, `credentials.enc`)
- `.github/**`, `core/**`, `app/**`, `.env*`, `node_modules/**`

Erro tipado (classe ou código) `PATH_FORBIDDEN` — mensagem clara, sem vazar token.

### 4.3 Branch policy

- Escrita exige parâmetro **`branch`** (string). **Recusar** escrita quando `branch` for `main` ou `master` (case-insensitive).
- Não implementar merge/PR nesta issue — só commits em branch de trabalho.
- Para `writeContentJson(path, data)` usado hoje pelos repositories **sem branch**: manter comportamento **local**; para GitHub, ou:
  - (A) exigir overload/opções `{ branch }` nas funções de write da porta, **ou**
  - (B) função separada `writeContentJsonOnBranch` usada só por serviços futuros.

**Escolha mínima correta:** estender a porta com parâmetro opcional `options?: { branch?: string; message?: string }`. Se backend GitHub e **sem** `branch` → erro explícito `BRANCH_REQUIRED` (não gravar em main por acidente). Dev local ignora `branch`.

### 4.4 Leitura com `ref`

- Estender `readGithubJson`, `readGithubText`, `getGithubContent` com `ref?: string` (branch ou SHA).
- Propagar para `readContentJson` / `readContentText` via options opcional `{ ref?: string }` — **default inalterado** (comportamento atual).
- Atualizar testes existentes em `github-content-store.test.ts` para passar `ref` quando assertar chamada Octokit.

### 4.5 Tokens e config

- Leitura: `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`, `GITHUB_TOKEN` (como hoje).
- Escrita: preferir `GITHUB_WRITE_TOKEN`; se ausente, **não** usar token de leitura automaticamente em produção — em **dev/test** pode documentar fallback opcional só se explicitamente seguro; ideal: write token obrigatório quando `getContentBackend() === "github"` e chamar write.
- Atualizar `.env.example` com comentários (sem valores reais).
- Nunca logar token, nunca incluir token em mensagem de erro.

### 4.6 Erros

Criar erros discriminados (ex.: `GithubContentError` com `code`):

- `NOT_CONFIGURED`, `PATH_FORBIDDEN`, `BRANCH_FORBIDDEN`, `BRANCH_REQUIRED`, `CONFLICT`, `UPSTREAM` (5xx/rede)

Mensagens em português, curtas, para operador — sem JSON bruto do GitHub.

### 4.7 Testes (Parte A)

Em `github-content-store.test.ts` (ou arquivo irmão `github-content-write.test.ts`):

- Allowlist aceita `content/projects/x/manual.json`
- Rejeita `../etc/passwd`, `core/foo.ts`, `data/projects/x/schema.json`
- Rejeita branch `main`
- Mock Octokit: verify ordem blob → tree → commit → updateRef
- Conflito em updateRef → CONFLICT
- Leitura com `ref: "portal-state"`

Rodar `npm run test`.

## 5. Parte B — RBAC editor / revisor (detalhe técnico)

### 5.1 Modelo de papéis

Estender:

```ts
export type UserRole = "admin" | "editor" | "reviewer" | "client";
```

Estender `PermissionsConfig`:

```ts
{
  admins: string[];      // e-mail exato ou @dominio (manter comportamento atual)
  editors: string[];     // SOMENTE e-mail exato
  reviewers: string[];   // SOMENTE e-mail exato
  clients: string[];
  defaultRole: UserRole; // incluir novos papéis no enum Zod se necessário
}
```

**Validação Zod:** rejeitar entradas em `editors`/`reviewers` que comecem com `@` (fail parse ou strip com warn — preferir **fail** no schema com mensagem clara).

### 5.2 Precedência em `resolveRole(email, config)`

Ordem (primeiro match vence):

1. `admins`
2. `reviewers` (e-mail exato)
3. `editors` (e-mail exato)
4. `clients` (exato ou @dominio)
5. `defaultRole`

Manter testes existentes de admin/client; adicionar casos editor/reviewer/precedência.

### 5.3 Helpers exportados (`core/auth/roles.ts` + reexport `core/auth/index.ts`)

Implementar e testar:

- `isAdminRole(role)` — **somente** `admin` (não mudar semântica para “superuser” genérico)
- `isEditorRole(role)` — `role === "editor"`
- `isReviewerRole(role)` — `role === "reviewer"`
- `isInternalStaffRole(role)` — `admin | editor | reviewer`
- `canEditContent(role)` — `admin | editor`
- `canReviewContent(role)` — `admin | reviewer`

### 5.4 Sessão

`core/auth/config.ts`: JWT/session deve carregar `UserRole` extended. Garantir `resolveRole` na criação/atualização do token.

### 5.5 Middleware e módulos

`core/auth/module-access.ts`:

- Rotas `/admin/**`: permitir `isInternalStaffRole` (admin, editor, reviewer) — **não** client.
- `canAccessLevel` para `access: "admin"`: permitir staff interno (admin | editor | reviewer), **exceto** se houver rotas ultra-sensíveis só admin — nesta issue, `/compliance` e playground admin podem continuar exigindo `isAdminRole` na **rota** específica.
- Ajustar `resolvePostLoginPath` / `getForbiddenRedirectPath`: staff interno tratado como admin para redirect (ex.: `/` vs `/docs`).

Atualizar `module-access.test.ts` se existir.

### 5.6 Rotas API living-docs (mudança mínima, consistente)

Padrão repetido hoje: `requireAdmin()` + `isAdminRole`.

Substituir por helpers centralizados em `core/auth/` (ex.: `requireContentEditor()`, `requireContentReviewer()`) para não duplicar lógica:

| Tipo de rota | Quem acessa (EDI-14341) |
|--------------|-------------------------|
| Edição manual, seções, operações, metadata, sync schema, family, bulk operations | `canEditContent` (admin + editor) |
| GET quality checklist | `canReviewContent` ou staff (admin + reviewer); editor pode continuar sem acesso se fizer sentido — **reviewer + admin** |
| **Publish** PATCH (`published: true/false`) | **admin + reviewer** (revisor valida publicação futura; alinhado à qualidade) — documentar |
| Connect gateway / connect-api (credenciais) | **admin only** (`isAdminRole`) — sensível |
| Playground GraphQL proxy, metrics, catalog-products admin CRUD | **admin only** |
| Export postman/insomnia | manter como hoje (admin ou quem já tinha) — preferir admin only |

Faça grep em `isAdminRole` e altere **só** rotas de edição de conteúdo + quality GET + publish conforme tabela. **Não** esquecer nenhum mutator de conteúdo.

Arquivos típicos: `app/api/living-docs/projects/[slug]/manual/route.ts`, `sections/**`, `operations/**`, `publish/route.ts`, `quality/route.ts`, etc.

### 5.7 Permissions example

Atualizar `data/permissions.example.json` com arrays vazios `editors`, `reviewers` e comentário no README interno se houver. **Não** commitar e-mails reais.

### 5.8 Testes (Parte B)

- `core/auth/roles.test.ts` — novos papéis, precedência, rejeição @ em editors no schema (`permissions-config` test)
- `permissions-loader.test.ts` — se schema file incluir editors
- Ajustar testes que assumem só admin|client

## 6. Parte C — Compliance

Adicionar em `modules/compliance/data/controls.ts` (status `ativo` ou `parcial`):

1. **GitHub CMS write allowlist** — paths limitados, token server-side
2. **RBAC editor/reviewer** — e-mail exato, sem domínio para editor/revisor
3. **GitHub write branch policy** — proibido commit direto em main via portal

`verification` com comando/rota/arquivo real.

## 7. Fora de escopo (não codar)

- UI `/admin/fila`, labels PR, GitHub App, webhooks, `modules/publicacao/`, `modules/radar/`
- Botão "Enviar para validação", desligar gravação local no editor
- E-mail, cron Radar
- Alterar `syncSchema` para Radar
- Commits automáticos em `main`
- Novas dependências npm salvo necessidade extrema

## 8. Processo de trabalho (cautela)

1. Ler arquivos listados na seção 3.
2. Implementar Parte A com testes.
3. Implementar Parte B com testes.
4. Compliance.
5. `npm run ci` — corrigir até verde.
6. Revisar grep: `isAdminRole` em rotas de edição — devem usar `canEditContent`.
7. **Não** commitar a menos que o usuário peça; se commitar, mensagem clara `feat(edi-14341): ...`

## 9. Entrega final obrigatória (formato da resposta)

Ao terminar, responda **exatamente** com estas seções:

### O que foi implementado
(bullets por Parte A, B, C)

### Arquivos principais alterados
(lista)

### Como testar
(comandos + env vars fictícias)

### Decisões tomadas
(ex.: overload branch, publish reviewer, delete github)

### Fora de escopo / próximas issues
(EDI-14342, EDI-14335, …)

### Riscos e limitações
(ex.: PAT vs GitHub App, homolog)

---

**Comece agora:** leia `core/db/adapters/index.ts`, `github-content-store.ts`, `core/auth/roles.ts`, `module-access.ts`, grep `isAdminRole` em `app/api/living-docs`.
