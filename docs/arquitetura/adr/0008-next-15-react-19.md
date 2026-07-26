# ADR-0008: Next.js 15 + React 19 antes da primeira feature

- **Status:** Aceita
- **Data:** 2026-07-26

## Contexto

A fundação (Fase 1) nasceu no Next.js 14.2.28 / React 18.3.1 — mesma versão
do portal anterior (`documentacao-funcional`), por segurança na fatia
inicial. O parecer de migração feito para o portal anterior (Next 14 → 16)
mostrou que o custo real de migrar cresce com o número de rotas dinâmicas,
chamadas a `params`/`headers()` síncronas e camadas de cache (`unstable_cache`)
já escritas em cima do padrão antigo — ali, o esforço estimado foi de
5–7 dias.

Aqui a fundação ainda tem só 2 rotas (`/` e `/api/health`), nenhum `params`
dinâmico, nenhum `unstable_cache` e nenhum `webpack()` customizado no
`next.config.mjs`. É o momento mais barato possível para dar esse passo —
o mesmo trabalho, feito depois de os 5 módulos ficarem `active`, custaria
muito mais.

## Decisão

- **Next.js `14.2.28` → `15.5.21`.**
- **React `18.3.1` → `19.2.8`** (App Router do Next 15 exige React 19
  estável — não há suporte a React 18 fora do Pages Router).
- **`next-auth` `5.0.0-beta.25` → `5.0.0-beta.32`** — corrige os mesmos CVEs
  críticos do Auth.js identificados no parecer do portal anterior (fail-open
  de auth, bypass de e-mail por homóglifo) e adiciona suporte oficial ao
  Next 16, mantendo margem para o próximo degrau.
- `eslint-config-next` e `@types/react*` acompanham as versões acima.
- **Não subimos para Next 16 agora** — Turbopack-only e a troca
  `middleware.ts` → `proxy.ts` ainda não têm ganho que justifique o risco
  antes da primeira feature real.

## Consequências

- **Mais fácil:** todo módulo futuro já nasce em cima de `params`/`headers()`
  assíncronos (padrão atual do Next), sem dívida de migração acumulada.
- **Mais difícil:** nenhuma mudança de código foi necessária nesta migração
  — validado por `npm run ci` (typecheck, lint, arch, test, build, todos
  verdes). O único aviso não bloqueante é sobre `jose`/Edge Runtime, comum a
  qualquer app Auth.js v5 rodando `middleware.ts` na Edge.
- **Residual conhecido:** `npm audit` aponta `postcss`/`sharp` vulneráveis —
  ambos empacotados **dentro** do próprio `next@15.5.21` (não são
  dependências nossas). Sem uso de `next/image`, a exposição de `sharp` é
  nula hoje; reavaliar quando o Next publicar um patch ou quando o portal
  passar a usar otimização de imagem.
- **Revisar quando:** Next 16 tiver adoção madura no ecossistema (Auth.js,
  Tailwind, dependency-cruiser) e o portal tiver rotas dinâmicas suficientes
  para justificar medir o esforço de novo.
