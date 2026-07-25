# Portal de Integração

Portal modular do time **EDI / Tecnologia**: documentação viva (interna e
externa), geradores de fluxograma, processos de homologação e automações com IA.
Construído com a **fundação primeiro** — esqueleto sólido antes de features.

## Stack

- **Next.js 14** (App Router) — UI + BFF
- **TypeScript** + **Zod** (contratos de dados)
- **Auth.js v5** — login SSO (mesmo contrato do portal atual) + RBAC
- **Tailwind CSS**
- **IA** desenhada no dia 1 em `core/ai` (provedor plugável, guardrails, custo)
- **Banco:** ainda não — stateless-first, com alerta quando um recurso exigir
  (ver `docs/arquitetura/adr/0002`)

## Estrutura

```
app/            # Next.js (UI + BFF)
core/           # invariantes: auth, config, db, errors, ai, events, module-registry
modules/        # bounded contexts (living-docs-externa, manuais-internos,
                #   fluxogramas, homologacao, assistente-ia)
docs/arquitetura/adr/   # decisões versionadas (ADRs)
```

Regra de dependência: `app → modules → core`. Módulos não se importam entre si —
comunicam-se por eventos (`core/events`).

## Rodar

```bash
cp .env.example .env.local     # preencher AUTH_SECRET (mínimo)
npm install
npm run dev                    # http://localhost:3002
```

- Login dev (local): habilite `DEV_AUTH_ENABLED=true` em `.env.local`.
- Healthcheck / planta viva: `GET /api/health`.

## Qualidade

```bash
npm run typecheck && npm run lint && npm run build   # = npm run ci
```

## Como adicionar um módulo

1. Crie `modules/<contexto>/module.ts` com o contrato `PortalModule`.
2. Registre em `modules/registry.ts`.
3. Se o módulo exigir dados transacionais, declare `requiresCapabilities` — o
   portal sinaliza o bloqueio até a decisão de banco (ADR-0002).

> Decisões de arquitetura: veja `docs/arquitetura/adr/`.
