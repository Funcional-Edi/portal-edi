# `modules/` — Bounded contexts (extensível)

Cada módulo é um contexto de negócio isolado, com rotas, services, repositório e
schema próprios. Consomem `core/`; **não se importam entre si** (comunicam-se por
eventos via `core/events`).

## Convenção interna

```
modules/<contexto>/
  module.ts       # contrato p/ o module-registry (rota base, RBAC, público, capacidades)
  schema/         # tipos + validação Zod
  repository/     # acesso a dados (hoje content; futuro: adapter core/db)
  services/       # regra de negócio (não conhece framework nem persistência)
  ui/             # componentes do módulo (opcional)
```

## Módulos previstos

| Módulo | Público | Estado | Persistência |
|--------|---------|--------|--------------|
| `living-docs-externa` | Clientes | Planejado | `content` |
| `manuais-internos` | Time EDI | Planejado | `content` |
| `fluxogramas` | Ambos | Planejado | `content` |
| `homologacao` | Time EDI | Planejado | **exige banco** (`transactional`, `audit-log`) |
| `assistente-ia` | Time EDI | Planejado | **exige banco** (`vector-search` p/ RAG) |

Módulos que exigem capacidades indisponíveis aparecem bloqueados em
`/api/health` e na landing — o alerta de banco (ADR-0002).
