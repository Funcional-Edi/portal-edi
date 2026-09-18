# Mapa do projeto

Referência rápida de **onde cada coisa mora** e **por quê**. Atualize este
documento quando a estrutura mudar.

## Visão geral

```
portal-integracao/
├── app/              # Next.js — UI + BFF (rotas, layout, API routes)
├── core/             # Fundação compartilhada (auth, db, ai, events…)
├── modules/          # Bounded contexts de negócio (isolados entre si)
├── config/           # Configs de ferramentas (fora da raiz quando possível)
├── docs/             # Documentação (ADRs, migração, este mapa)
├── types/            # Augmentações de tipos globais (ex.: next-auth)
└── [raiz]            # Manifesto npm + configs exigidas pelas ferramentas
```

Regra de dependência: **`app → modules → core`**. Validada por
`npm run arch` (`config/dependency-cruiser.cjs`).

## Código de aplicação

| Pasta | Papel | README |
|-------|-------|--------|
| `app/` | Camada de entrada Next.js: páginas, layout, middleware hook, rotas `/api/*` | — |
| `core/` | Invariantes: auth, config, db, errors, ai, events, **ui** (casca), module-registry | [`core/README.md`](../../core/README.md) · [`core/ui/README.md`](../../core/ui/README.md) |
| `modules/` | Contextos de negócio registrados em `modules/registry.ts` | [`modules/README.md`](../../modules/README.md) |
| `types/` | Declarações TypeScript globais (não é código de runtime) | — |

### Módulos previstos (`modules/`)

| ID | Público | Estado |
|----|---------|--------|
| `living-docs-externa` | Clientes | **ativo** |
| `manuais-internos` | Time EDI | **ativo** |
| `fluxogramas` | Ambos | **ativo** |
| `homologacao` | Time EDI | planejado (exige banco) |
| `assistente-ia` | Time EDI | planejado (exige vector-search) |

Convenção interna de cada módulo: `module.ts`, `schema/`, `repository/`,
`services/`, `ui/` (opcional).

## Documentação (`docs/`)

| Pasta / arquivo | Conteúdo |
|-----------------|----------|
| `docs/arquitetura/adr/` | Decisões de arquitetura (ADRs 0001–0010) |
| `docs/migracao/` | Mapa, cronograma e decisões de UI da migração |
| `docs/operacao/` | Guias operacionais de release e rotina de validacao |
| `docs/estrutura/mapa-projeto.md` | Este arquivo |
| `docs/estrutura/navbar-produtos.md` | Contrato, rotas e manutenção da navbar de produtos EDI |

## Configuração (`config/`)

| Arquivo | Ferramenta | Script |
|---------|------------|--------|
| `dependency-cruiser.cjs` | Fronteiras de arquitetura | `npm run arch` |
| `vitest.config.ts` | Testes unitários | `npm run test` |

## Raiz — arquivos obrigatórios ou convencionados

Estes arquivos **devem** ficar na raiz: as ferramentas os procuram ali por
padrão. Não mover sem motivo forte.

| Arquivo | Função | Movível? |
|---------|--------|----------|
| `package.json` | Manifesto npm, scripts, dependências | Não |
| `package-lock.json` | Lock de versões npm | Não |
| `next.config.mjs` | Configuração do Next.js | Não |
| `tsconfig.json` | Projeto TypeScript + alias `@/*` | Não |
| `middleware.ts` | Middleware Next (auth, headers) | Não (ou `src/` se adotar layout src) |
| `.env.example` | Template de variáveis de ambiente | Não (convenção Next) |
| `.gitignore` | Arquivos ignorados pelo Git | Não |
| `.nvmrc` | Versão do Node (20.x) | Não |
| `README.md` | Entrada do repositório | Não |
| `.eslintrc.json` | Regras ESLint (`next/core-web-vitals`) | Possível, com migração flat config |
| `postcss.config.js` | Pipeline CSS (Tailwind + Autoprefixer) | Possível, com ajuste no Next |
| `tailwind.config.ts` | Tema e content paths do Tailwind | Possível, com ajuste no PostCSS |
| `next-env.d.ts` | Tipos gerados pelo Next | Não (gerado; gitignored) |
| `tsconfig.tsbuildinfo` | Cache incremental do tsc | Não (gerado; gitignored) |

## Artefatos gerados (não versionar)

| Pasta / arquivo | Origem |
|-----------------|--------|
| `node_modules/` | `npm install` |
| `.next/` | `next dev` / `next build` |
| `coverage/` | `npm run test:coverage` |
| `architecture.dot` | `npm run arch:graph` |

## Comandos de qualidade

```bash
npm run ci    # typecheck → lint → arch → test → build
```

| Comando | Valida |
|---------|--------|
| `npm run typecheck` | Tipos TypeScript |
| `npm run lint` | ESLint |
| `npm run arch` | Regras `app → modules → core` |
| `npm run test` | Vitest (core + modules) |
| `npm run build` | Build de produção Next |

## Onde ler mais

- Decisões estruturais: [`docs/arquitetura/adr/`](../arquitetura/adr/)
- Fundação: [`core/README.md`](../../core/README.md)
- Módulos: [`modules/README.md`](../../modules/README.md)
- Configs de ferramentas: [`config/README.md`](../../config/README.md)
