# Decisões de UI — Portal de Integração (`feat/ui-portal`)

> Branch: `feat/ui-portal` · Data: 2026-08-04 · ADR: [0010](../arquitetura/adr/0010-ui-shell-compartilhado.md)

Registro do **porquê** do redesign da casca. Complementa o ADR com análise de
UX, arquivos tocados e checklist de validação.

---

## 1. Diagnóstico — por que parecia “legado”

| Sintoma | Causa no código | Correção |
|---------|-----------------|----------|
| Três “sites” diferentes | Header duplicado em home / manual / admin | `core/ui/app-shell.tsx` |
| Tipografia genérica | Sem `next/font` / Geist | `app/layout.tsx` + `tailwind` `fontFamily` |
| Cards só texto | Sem ícones | `lucide-react` |
| Status difíceis de escanear | `span` com classes ad-hoc | `core/ui/badge.tsx` (tons) |
| Sem logout | Cookie só via DevTools | `core/ui/session-actions.tsx` |
| Login confuso | SSO vs dev decididos pela senha preenchida | Abas explícitas em `login-form.tsx` |
| Home sem hierarquia | Lista única ativo + planejado | Seções “Em produção” / “Planejados” |
| Catálogo raso | Só nome + descrição + pills iguais | Ícone, badge por ambiente, CTA, data |

---

## 2. Princípios adotados

1. **Uma casca, layouts de domínio** — header compartilhado; sidebar/TOC do
   manual e main do admin ficam nos módulos.
2. **Hierarquia antes de decoração** — ativo vs planejado; produção vs homolog.
3. **Ação óbvia** — CTA “Abrir” / “Abrir roteiro” / “Entrar” / “Sair”.
4. **Manter a marca teal** — `brand` do Tailwind existente; não trocar por tema
   “IA genérico” (roxo, cream+serif).
5. **Sem regra de negócio em `core/ui`** — só apresentação e sessão.

---

## 3. Arquivos

### Fundação

| Arquivo | Mudança |
|---------|---------|
| `core/ui/app-shell.tsx` | **Novo** — `AppHeader`, `AppShell` |
| `core/ui/badge.tsx` | **Novo** — tons semânticos |
| `core/ui/session-actions.tsx` | **Novo** — Entrar / Sair |
| `core/ui/README.md` | **Novo** — guia de uso |
| `app/layout.tsx` | Geist Sans + Mono |
| `app/globals.css` | (inalterado estruturalmente) |
| `tailwind.config.ts` | `fontFamily.sans` / `mono` → variáveis Geist |
| `package.json` | deps `geist`, `lucide-react` |

### Telas

| Arquivo | Mudança |
|---------|---------|
| `app/page.tsx` | `AppShell` + seções ativo/planejado + ícones + CTA |
| `app/login/page.tsx` | Marca visual alinhada |
| `app/login/login-form.tsx` | Abas SSO / Login local (dev) |
| `app/manual/page.tsx` | `navItems` Catálogo ativo |
| `modules/.../manual-shell.tsx` | Compõe `AppHeader` + `SessionActions` |
| `modules/.../manual-catalog.tsx` | Cards com hierarquia, badges, CTA |
| `modules/.../admin-shell.tsx` | Compõe `AppHeader` + nav Projetos/Catálogo |

### Documentação

| Arquivo | Mudança |
|---------|---------|
| `docs/arquitetura/adr/0010-ui-shell-compartilhado.md` | Decisão estrutural |
| `docs/migracao/decisoes-ui.md` | Este arquivo |
| `docs/migracao/README.md` | Link |
| `docs/estrutura/mapa-projeto.md` | `core/ui` no mapa |
| `core/README.md` | Linha `ui/` |

---

## 4. Fluxo visual (antes → depois)

```text
ANTES
  /          → lista flat, sem nav, sem logout
  /manual    → header "próprio" + cards rasos
  /admin     → outro header quase igual
  /login     → senha decide o provider

DEPOIS
  AppHeader (marca + subtítulo + nav + SessionActions)
       ├── /          AppShell + hierarquia de módulos
       ├── /manual*   ManualShell (AppHeader + sidebar/TOC)
       ├── /admin*    AdminShell (AppHeader + main)
       └── /login     marca alinhada + abas de método
```

---

## 5. Checklist de validação manual

Com `npm run dev` (porta **3002**), sem outro Next na mesma pasta:

| # | Rota | O que conferir |
|---|------|----------------|
| 1 | `/` | Header com marca; módulo ativo com CTA “Abrir”; planejados secundários |
| 2 | `/login` | Aba correta (só SSO, só dev, ou as duas); foco visível nos inputs |
| 3 | `/manual` | Cards com ambiente colorido, gateway, “Abrir roteiro”, “Sair” se logado |
| 4 | `/manual/[slug]` | Mesmo header; sidebar/TOC intactos |
| 5 | `/admin/projects` | Header Admin; nav Projetos; logout funciona |
| 6 | Logout | “Sair” → `/login`; cookie de sessão encerrado |

Automatizado (quando possível):

```powershell
# Parar o dev antes (Ctrl+C) — evita EPERM em .next
npm run ci
```

---

## 6. O que ficou de fora (próximos PRs)

- Design system completo / Storybook
- Nav mobile (hamburger) — hoje nav some em `< sm`
- Dark mode intencional (só `color-scheme` no CSS)
- Empty states e skeletons em admin
- Microcopy e ilustrações de marca Fidelize
- ~~**Fase B:** permissões externas via `data/permissions.json`~~ ✅ Fase 9

---

## 7. RBAC + UX de entrada (Fase A)

> Data: 2026-08-06 · Branch: `feat/ui-portal`

### Objetivo

`/` vira **porta única** do portal: login inline quando deslogado; hub filtrado
por papel quando logado. SSO igual para todos — diferença só no `role` após login.

### Papéis

| Papel | Quem | Vê na home | Rotas |
|-------|------|------------|-------|
| `client` | Distribuidor (default) | Módulos `access: "any"` | `/manual/**`, futuros `/fluxogramas/**` |
| `admin` | Time EDI | Hub completo + planejados | Tudo + `/admin/**` |

Resolução de papel: `core/auth/roles.ts` (`resolveRole`). Middleware e home
usam `core/auth/module-access.ts` (`canAccessModule`, `canAccessPath`).

### Fluxo

```text
Deslogado em /manual ou /admin
  → middleware redireciona /?callbackUrl=<rota>
  → login inline na home
  → pós-login: admin → / (ou callback seguro); client → /manual

/login (legado)
  → redirect / preservando callbackUrl
```

### Arquivos

| Arquivo | Papel |
|---------|-------|
| `core/auth/module-access.ts` | RBAC derivado do module-registry |
| `core/auth/module-access.test.ts` | Testes unitários |
| `middleware.ts` | Enforcement genérico por módulo |
| `app/page.tsx` | Login inline + hub por role |
| `app/login/page.tsx` | Redirect → `/` |
| `app/login/login-form.tsx` | Redirect pós-login via server action |
| `app/login/actions.ts` | `getPostLoginPath()` |

### Validação manual

| # | Cenário | Esperado |
|---|---------|----------|
| 1 | `/` deslogado | Formulário de login |
| 2 | Client logado em `/` | Só card “Documentação Viva”; sem “Planejados” |
| 3 | Client em `/admin/projects` | Redirect `/manual` |
| 4 | Admin logado em `/` | Módulos ativos + planejados + link Admin |
| 5 | `/login?callbackUrl=/manual/im` | Redirect `/` com callback; após login vai ao manual |

---

## 8. Pegadinhas aprendidas nesta frente

| Situação | Lição |
|----------|--------|
| `npm run ci na fase-3-admin` | Texto extra vira argumento do `next build` |
| `EPERM` em `.next/trace` | Não rodar `build`/`ci` com `npm run dev` na mesma pasta |
| Módulos não se importam | Shell compartilhado **tem** que ficar em `core/ui` |
