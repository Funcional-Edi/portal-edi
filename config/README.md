# `config/` — Configuração de ferramentas

Configs que **podem** sair da raiz sem quebrar convenções das ferramentas.
Cada arquivo é referenciado explicitamente nos scripts do `package.json`.

| Arquivo | Ferramenta | Comando |
|---------|------------|---------|
| `dependency-cruiser.cjs` | dependency-cruiser | `npm run arch` |
| `vitest.config.ts` | Vitest | `npm run test` |

Adapters de persistência: `core/db/adapters/` (ADR-0009).

Configs que **permanecem na raiz** (exigência das ferramentas): `next.config.mjs`,
`tsconfig.json`, `postcss.config.js`, `tailwind.config.ts`, `.eslintrc.json`.

Mapa completo: [`docs/estrutura/mapa-projeto.md`](../docs/estrutura/mapa-projeto.md).
