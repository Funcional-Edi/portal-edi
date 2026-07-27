# `living-docs-externa` — Documentação viva (clientes)

Manuais de integração GraphQL curados por produto. Substitui PDFs artesanais.

## Estrutura

```
schema/       # Zod: ProjectConfig, IntegrationManual
repository/   # Leitura CMS (content/ + data/)
services/     # Regras: listagem publicada, get manual
ui/reader/    # Catálogo, roteiro, detalhe de operação
ui/admin/     # (Fase 3+) CRUD projetos, editor
```

## Rotas

| Rota | UI |
|------|-----|
| `/manual` | Catálogo |
| `/manual/[slug]` | Roteiro |
| `/manual/[slug]/operations/[kind]/[name]` | Operação |

## CMS

Layout compatível com `documentacao-funcional` (ADR-0009). Seed: `content/projects/demo/`.

Seções Markdown: `content/projects/{slug}/sections/*.md` (etapa 2.1).

Mapa de migração: [`docs/migracao/mapa-documentacao-funcional.md`](../../docs/migracao/mapa-documentacao-funcional.md).
