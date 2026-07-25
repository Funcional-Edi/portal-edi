# ADRs — Registros de Decisão de Arquitetura

Decisões estruturais no formato de Michael Nygard: **contexto → decisão →
consequência**. Curtas, versionadas, imutáveis (uma nova decisão que substitua
outra referencia a anterior como *Substituída por*).

| # | Título | Status |
|---|--------|--------|
| [0001](./0001-estrutura-modular.md) | `core/` (invariante) + `modules/` (bounded contexts) | Aceita |
| [0002](./0002-camada-dados-adapter.md) | Stateless agora; banco só quando um recurso exigir (com alerta) | Aceita |
| [0003](./0003-sso-contrato.md) | SSO reimplementado com o MESMO contrato do portal atual | Aceita |
| [0004](./0004-stack-ts-core.md) | Núcleo TypeScript/Next.js; Python só como microserviço de IA quando exigir | Aceita |
| [0005](./0005-camada-ia.md) | Camada de IA desenhada no dia 1 (provedor único, guardrails, custo) | Aceita |

> Template: [`_template.md`](./_template.md).
