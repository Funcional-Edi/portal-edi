# Portal de Integração

Portal modular do time **EDI / Tecnologia**: documentação viva (interna e
externa), geradores de fluxograma, processos de homologação e automações com IA.
Construído com a **fundação primeiro** — esqueleto sólido antes de features.

## Stack

- **Next.js 15** (App Router) — UI + BFF
- **TypeScript** + **Zod** (contratos de dados)
- **Auth.js v5** — login SSO (mesmo contrato do portal atual) + RBAC
- **Tailwind CSS**
- **IA** desenhada no dia 1 em `core/ai` (provedor plugável, guardrails, custo)
- **Banco:** ainda não — stateless-first, com alerta quando um recurso exigir
  (ver `docs/arquitetura/adr/0002`)

## Estrutura

```
app/                    # Next.js (UI + BFF)
core/                   # invariantes: auth, config, db, errors, ai, events, module-registry
modules/                # bounded contexts (living-docs-externa, manuais-internos,
                        #   fluxogramas, homologacao, assistente-ia)
config/                 # configs de ferramentas (dependency-cruiser, vitest)
docs/
  arquitetura/adr/      # decisões versionadas (ADRs)
  estrutura/            # mapa do projeto (mapa-projeto.md)
```

Mapa completo de pastas e arquivos da raiz: [`docs/estrutura/mapa-projeto.md`](docs/estrutura/mapa-projeto.md).

**Painel do projeto** (mapa, segurança, Kanban de prioridades e trilhas de estudo, tudo em uma tela): [`docs/painel/index.html`](docs/painel/index.html) — abra direto no navegador.

Migração da documentação viva: [`docs/migracao/mapa-documentacao-funcional.md`](docs/migracao/mapa-documentacao-funcional.md) · [`docs/migracao/cronograma.md`](docs/migracao/cronograma.md).

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
- Smoke homolog: `npm run smoke:homolog` (ver [`docs/migracao/deploy-homolog.md`](docs/migracao/deploy-homolog.md)).

## Deploy homolog

```bash
cp .env.example .env.local          # preencher AUTH_SECRET, SSO, etc.
cp data/permissions.example.json data/permissions.json
npm run ci
npm run start                       # ou docker build / docker run — ver deploy-homolog.md
npm run smoke:homolog
```

Docker: [`Dockerfile`](Dockerfile) · Guia: [`docs/migracao/deploy-homolog.md`](docs/migracao/deploy-homolog.md).

## Qualidade

```bash
npm run ci          # typecheck → lint → arch → test → build
```

| Comando | O que garante |
|---------|---------------|
| `npm run typecheck` | Tipos consistentes |
| `npm run lint` | Padrão de código |
| `npm run arch` | **Regra de dependência não foi violada** (`app → modules → core`, módulos isolados, sem ciclos) |
| `npm run test` | Comportamento da fundação (vitest) |
| `npm run test:coverage` | Relatório de cobertura |
| `npm run arch:graph` | Gera `architecture.dot` com o grafo de dependências |

A arquitetura é **verificada por máquina**, não só documentada: importar um
módulo de dentro de outro, ou fazer `core/` depender de `modules/`, **quebra o
build**. Ver `docs/arquitetura/adr/0006-arquitetura-enforcada.md`.

## Como adicionar um módulo

1. Crie `modules/<contexto>/module.ts` com o contrato `PortalModule`.
2. Registre em `modules/registry.ts`.
3. Se o módulo exigir dados transacionais, declare `requiresCapabilities` — o
   portal sinaliza o bloqueio até a decisão de banco (ADR-0002).

> Decisões de arquitetura: veja `docs/arquitetura/adr/`.
