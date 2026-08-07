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
| [0006](./0006-arquitetura-enforcada.md) | Arquitetura verificada por máquina (CI) + estratégia de testes | Aceita |
| [0007](./0007-rate-limit-login.md) | Rate limit no login SSO (proteção contra força bruta) | Aceita |
| [0008](./0008-next-15-react-19.md) | Next.js 15 + React 19 antes da primeira feature | Aceita |
| [0009](./0009-content-cms-adapter.md) | Persistência `content`: filesystem local + GitHub CMS | Aceita |
| [0010](./0010-ui-shell-compartilhado.md) | Shell de UI compartilhado em `core/ui` | Aceita |

> Template: [`_template.md`](./_template.md).
