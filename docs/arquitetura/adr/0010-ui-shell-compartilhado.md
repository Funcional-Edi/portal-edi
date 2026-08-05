# ADR-0010: Shell de UI compartilhado em `core/ui`

- **Status:** Aceita
- **Data:** 2026-08-04

## Contexto

Até a branch `feat/ui-portal`, cada área do portal reimplementava o próprio
cabeçalho:

- `app/page.tsx` — sem header (só título na página)
- `modules/.../ui/reader/manual-shell.tsx` — header próprio
- `modules/.../ui/admin/admin-shell.tsx` — outro header, quase igual

Efeitos observados:

1. Visual inconsistente (usuário sente “vários sites”)
2. Sem logout em lugar nenhum (só apagar cookie)
3. Sem fonte tipográfica própria — stack padrão do browser
4. Badges/status com classes Tailwind soltas e cores quase idênticas

A regra de arquitetura (`app → modules → core`) impede que um módulo
exporte UI para outro. Logo, a casca **não** pode viver só em
`living-docs-externa`.

## Decisão

Adotamos uma fundação visual em `core/ui/`:

| Peça | Papel |
|------|-------|
| `AppHeader` / `AppShell` | Marca + nav + slot de ações |
| `Badge` | Tons semânticos reutilizáveis |
| `SessionActions` | Entrar / Sair via `core/auth` |

Dependências de UI de fundação:

- **Geist** (`geist`) — fonte sans/mono via CSS variables no `app/layout.tsx`
- **lucide-react** — ícones tree-shakeable

Shells de domínio (`ManualShell`, `AdminShell`) **permanecem** nos módulos:
eles compõem `AppHeader` + layout específico (sidebar, TOC, main admin).

## Consequências

**Mais fácil**

- Uma mudança no header (logout, marca, nav) reflete em todas as áreas
- Novos módulos reutilizam a casca sem acoplar em `living-docs-externa`
- Documentação da UX fica ancorada em componentes concretos

**Mais difícil / restrições**

- `core/ui` não pode importar `modules/` (já validado por `npm run arch`)
- Ícones de domínio (mapa módulo → ícone) ficam na página/`modules`, não no core
- Redesign profundo de um módulo continua local; só a casca é compartilhada

**Quando revisar**

- Se surgir design system formal (Storybook, tokens em pacote) — extrair de
  `core/ui` para pacote interno, mantendo a mesma fronteira
- Se a home deixar de ser “planta de módulos” e virar produto marketing —
  revisar hierarquia visual sem mover a fundação

Detalhamento de UX e checklist: [`docs/migracao/decisoes-ui.md`](../../migracao/decisoes-ui.md).
