# ADR-0009: Persistência `content` — filesystem local + GitHub CMS

- **Status:** Aceita
- **Data:** 2026-07-27

## Contexto

O módulo `living-docs-externa` (documentação viva para distribuidores) exige
persistência de manuais, schemas introspectados e credenciais de gateway. O portal
anterior (`documentacao-funcional`) resolveu isso com **CMS em arquivos**: pastas
`content/` e `data/` no repositório, com backend **local** em dev e **GitHub**
(Octokit) em produção — sem banco relacional (ADR-0002).

A fundação já declara a capacidade `"content"` como disponível em `core/db`. Falta
formalizar o adapter e manter **compatibilidade de layout** com o CMS legado para
facilitar migração de projetos (`im`, `wholesaler`, etc.).

## Decisão

- Adotamos **dois adapters** em `core/db/adapters/`:
  - **`local-content-store`** — lê/grava em `CONTENT_ROOT` (default: cwd do
    processo). Usado em dev, testes e CI.
  - **`github-content-store`** — Octokit REST (Fase 2). Usado quando
    `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` e token estiverem configurados.
- O **layout de arquivos** permanece igual ao legado:
  `content/projects/{slug}/config.json`, `manual.json`, `sections/*.md`;
  `data/projects/{slug}/schema.json`, `credentials.enc` (gitignored).
- Módulos acessam persistência **somente** via `repository/` que chama os
  adapters — nunca `fs` ou Octokit direto no service ou UI.
- Schemas Zod vivem em `modules/living-docs-externa/schema/` (domínio do módulo).
- Seleção de backend: função `getContentBackend()` em `core/db/adapters` —
  GitHub se configurado, senão local.

## Consequências

- **Mais fácil:** migrar conteúdo copiando pastas; testes usam seed em
  `content/projects/demo/`; paridade com portal antigo sem SQL.
- **Mais difícil:** conflitos de escrita simultânea no GitHub exigem retry/SHA
  (portar lógica do legado na Fase 2); credenciais exigem `AUTH_SECRET` para
  AES-256-GCM.
- **Revisar quando:** volume de manuais ou concorrência de edição justificar
  banco transacional (homologação já prevê isso em ADR-0002).
