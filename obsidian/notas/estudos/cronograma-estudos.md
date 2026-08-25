# Cronograma de estudos

Aprender **pelo que o projeto exige a seguir**, não por lista teórica solta. Cada
trilha tem uma entrega prática no Portal EDI.

## Ritmo sugerido

| Quando | O quê | Tempo |
| --- | --- | --- |
| Todo dia | 1 conceito novo + anotar no [[diario\|diário]] | 15 min |
| Todo dia | Implementar algo real no projeto | o resto |
| Fim do dia | `npm run ci` + commit | 10 min |
| Sexta | Revisar a semana, marcar trilhas concluídas aqui | 20 min |

Regra: **nada entra no painel sem ter sido usado no projeto.** Teoria sem prática não
fixa.

## Trilha 1 — Ferramentas do dia a dia

Base para não travar. Deve ficar automático.

- [x] Rodar o projeto (`npm run dev`, porta 3002)
- [x] Diferença `npm run dev` / `build` / `start`
- [x] PowerShell: `;` no lugar de `&&`, aspas em caminho com espaço
- [ ] Ciclo Git completo sem consultar nota: `status → diff → add → commit → push`
- [ ] Criar branch, trocar de branch, `stash`
- [ ] Abrir um Pull Request e ler o resultado do CI
- [ ] Resolver um conflito de merge de propósito (crie um para treinar)

Notas: [[comandos-projeto|Projeto]] · [[comandos-git|Git]] · [[comandos-terminal-windows|PowerShell]]

## Trilha 2 — TypeScript na prática

- [ ] `type` vs. `interface` — quando cada um
- [ ] `unknown` vs. `any` (e por que `any` é proibido no lint)
- [ ] Tipos derivados: `z.infer`, `Pick`, `Omit`, `Partial`
- [ ] Narrowing: como o TS "prova" que algo não é `undefined`
- [ ] Ler um erro do `tsc` de baixo para cima

Onde praticar: `modules/living-docs-externa/schema/manual.ts` usa `z.infer`, `pick`,
`omit` e `extend` — leia esse arquivo inteiro entendendo cada linha.

## Trilha 3 — Zod e validação de borda

- [ ] `parse` vs. `safeParse` (quando lançar erro, quando tratar)
- [ ] Validar entrada de API antes de chegar no service
- [ ] `z.enum`, `z.literal`, `.regex()`, `.optional()`, `.default()`
- [ ] Derivar schema de entrada a partir do schema de domínio

Onde praticar: `schema/project.ts` (`slugSchema` com regex) e qualquer
`app/api/.../route.ts`.

Conceito-chave: **validar na borda**. Depois do `parse`, o resto do código confia no
dado e fica mais simples.

## Trilha 4 — Next.js App Router

- [ ] Server Component vs. Client Component (`"use client"`)
- [ ] `layout.tsx` vs. `page.tsx`
- [ ] Rota dinâmica `[slug]` e `params`
- [ ] `route.ts` — GET/POST/PUT/DELETE
- [ ] `middleware.ts` — o que roda antes de tudo
- [ ] Cache e revalidação por tag (`unstable_cache`)

Onde praticar: `app/manual/[slug]/page.tsx`, `middleware.ts`,
`modules/living-docs-externa/services/cache-tags.ts`.

## Trilha 5 — Arquitetura em camadas

- [ ] Por que `app → modules → core` e nunca ao contrário
- [ ] O que é *bounded context*
- [ ] Papel de cada camada: `schema` / `repository` / `services` / `ui`
- [ ] Comunicação entre módulos só por eventos
- [ ] Ler a saída do `npm run arch` e entender uma violação

Onde praticar: crie um import proibido de propósito, rode `npm run arch`, veja quebrar,
desfaça. Aprender a regra **vendo ela funcionar**.

Notas: [[fluxo-novo-modulo|Módulo novo]] · ADR-0001, ADR-0006

## Trilha 6 — Testes

- [ ] Vitest: `describe`, `it`, `expect`
- [ ] Mock de dependência (`vi.mock`)
- [ ] Teste de unidade vs. integração vs. E2E
- [ ] Playwright: rodar e ler o relatório
- [ ] Escrever o teste **antes** da implementação

Onde praticar: `services/manual-quality.test.ts` é um bom exemplo de regra de negócio
testada; `tests/e2e/manual-flow.spec.ts` de fluxo completo.

## Trilha 7 — Segurança aplicada

- [ ] Por que segredo nunca vai para o browser
- [ ] Server-side proxy (por que o playground não chama o gateway direto)
- [ ] SSRF — o que é e o que `core/security/gateway-url.ts` impede
- [ ] Rate limit de login (ADR-0007)
- [ ] Criptografia de credencial (AES-256-GCM em `credentials.enc`)

## Trilha 8 — Fase 8 concluída (Export, busca, métricas, interno)

- [x] Export Postman/Insomnia (`export-postman.ts`, APIs `/export/*`)
- [x] Busca global Fuse.js + `Ctrl+K` (`core/search`, `CommandPalette`)
- [x] Métricas playground in-memory (`core/metrics`, `/admin/metrics`)
- [x] Módulo `manuais-internos` ativo em `/interno`

## Trilha 9 — Fase 9 concluída (Consolidação homolog)

- [x] RBAC via `data/permissions.json` (`permissions-loader.ts`)
- [x] Smoke homolog (`npm run smoke:homolog`)
- [x] Deploy Docker + docs (`deploy-homolog.md`)
- [x] Health enriquecido (`/api/health`)

## Depois (Fase 10+)

- [x] Export PDF
- [x] Validar conteúdo publicado por script (`content:validate-published`)
- [x] E2E allowlist do playground (permitido vs 403)
- [x] Referência GraphQL global (`/docs/api`)
- [ ] Persistir métricas em banco (se ADR exigir)

## Como marcar progresso

No Obsidian, clique na caixinha `- [ ]` para marcar. Ao concluir uma trilha, escreva
no [[diario|diário]] o que ficou claro — e o que ainda não.

↩ [[00-PAINEL-ESTUDOS|Painel de estudos]]
