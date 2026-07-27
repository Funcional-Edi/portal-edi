# `core/` — Fundação compartilhada (invariantes)

O que é estrutural e caro de mudar depois. Nenhum negócio mora aqui.

| Subpasta | Responsabilidade |
|----------|------------------|
| `auth/` | Login SSO (mesmo contrato do portal atual), RBAC, sessão — ver ADR-0003 |
| `config/` | Leitura tipada e validada de env (server-side; sem segredos no browser) |
| `db/` | Camada de dados: capacidades + **alerta quando um recurso exige banco** (ADR-0002); adapters em `db/adapters/` quando houver banco |
| `errors/` | Tipos de erro e serialização para a camada de entrada |
| `ai/` | Camada de IA: provedor plugável, guardrails, custo, RAG (ADR-0005) |
| `events/` | Barramento de eventos p/ comunicação entre módulos (sem acoplamento direto) |
| `module-registry.ts` | Registro de módulos (rota base, RBAC, público, capacidades) |

Regra de dependência: `core/` não importa de `modules/`.
