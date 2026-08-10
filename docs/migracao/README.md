# Migração — `documentacao-funcional` → Portal de Integração

Documentação da migração da **documentação viva** para o módulo
`living-docs-externa`.

| Documento | Conteúdo |
|-----------|----------|
| [`mapa-documentacao-funcional.md`](./mapa-documentacao-funcional.md) | Mapa ponta a ponta: rotas, APIs, código, melhorias |
| [`cronograma.md`](./cronograma.md) | Fases, datas, entregáveis e critérios de done |
| [`decisoes-ui.md`](./decisoes-ui.md) | Redesign da casca + RBAC (Fase A/B) |
| [`deploy-homolog.md`](./deploy-homolog.md) | Deploy homolog (Node/Docker, health, smoke) |
| [`github-cms-staging.md`](./github-cms-staging.md) | CMS GitHub em staging (ADR-0009) |
| [`fase-5-smoke-sso-homolog.md`](./fase-5-smoke-sso-homolog.md) | Checklist SSO pós-consolidação |
| [`fase-10-stateless-sem-banco.md`](./fase-10-stateless-sem-banco.md) | Guardrail pós-MVP: continuar sem banco |

**Estado:** Fases 0–9 entregues · **Fase 10** (polish pós-MVP sem banco) em andamento.

Decisões relacionadas:

- Persistência: [ADR-0009](../arquitetura/adr/0009-content-cms-adapter.md)
- Shell de UI: [ADR-0010](../arquitetura/adr/0010-ui-shell-compartilhado.md)
