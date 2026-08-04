# Criar um módulo novo neste projeto

Módulo = *bounded context* (um pedaço de negócio isolado). Hoje existem 5, registrados
em `modules/registry.ts`.

| Módulo | Estado | Rota |
| --- | --- | --- |
| `living-docs-externa` | ativo | `/manual` |
| `manuais-internos` | planejado | `/interno` |
| `fluxogramas` | planejado | `/fluxogramas` |
| `homologacao` | planejado | — (exige banco) |
| `assistente-ia` | planejado | — (exige banco) |

## Anatomia de um módulo

```text
modules/<contexto>/
├── module.ts        # metadados (id, rota, acesso, capacidades) — obrigatório
├── schema/          # contratos Zod (formato dos dados)
├── repository/      # leitura/gravação (filesystem, GitHub)
├── services/        # regra de negócio (+ testes ao lado)
└── ui/              # componentes React (opcional)
    ├── reader/      # visão do cliente
    └── admin/       # visão do time EDI
```

## Passo 1 — `module.ts`

```typescript
import type { PortalModule } from "@/core/module-registry";

export const fluxogramasModule: PortalModule = {
  id: "fluxogramas",
  title: "Fluxogramas",
  description: "Geração de diagramas de fluxo a partir do conteúdo curado.",
  status: "planned",          // planned | active
  basePath: "/fluxogramas",
  access: "any",              // any | admin
  audience: "ambos",          // distribuidor | interno | ambos
  requiresCapabilities: ["content"],
};
```

`requiresCapabilities` é o "alerta de banco": se a capacidade não existir, o módulo
aparece como **bloqueado** em `/` e em `/api/health` em vez de quebrar (ADR-0002).

## Passo 2 — registrar

Em `modules/registry.ts`, importe e adicione ao array `ALL_MODULES`.

## Passo 3 — camadas, de dentro para fora

| Ordem | O que criar | Regra |
| --- | --- | --- |
| 1 | `schema/*.ts` | Zod define o formato; exporte os tipos com `z.infer` |
| 2 | `repository/*.ts` | Só I/O, via `core/db/adapters` — **nunca** `fs` direto |
| 3 | `services/*.ts` | Regra de negócio, sem React/Next |
| 4 | `services/*.test.ts` | Teste ao lado do service |
| 5 | `ui/` | Componentes |
| 6 | `app/api/...` + `app/<rota>/` | Casca fina que chama os services |

## Passo 4 — ativar

Troque `status: "planned"` → `"active"` quando as rotas existirem. Só então o módulo
aparece navegável na home.

## Passo 5 — validar

```powershell
npm run arch     # fronteiras de módulo
npm run ci       # tudo
```

## As 3 regras que mais quebram o CI

| Regra | Errado | Certo |
| --- | --- | --- |
| Módulo não importa módulo | `import { x } from "@/modules/living-docs-externa/..."` | Publicar/ouvir evento em `core/events` |
| `core` não conhece módulos | `core/db` importando `modules/...` | Módulo importa `core`, nunca o contrário |
| Service sem UI | `services/x.ts` com `import React` | React só em `ui/` e `app/` |

## Por que tanta cerimônia

Sem fronteira, todo módulo acaba importando todo mundo e nada pode ser mudado sozinho
("big ball of mud"). Aqui a fronteira é **verificada por máquina** (`npm run arch`,
dependency-cruiser) — violar quebra o build, então não apodrece (ADR-0006).

↩ [[00-PAINEL-ESTUDOS|Painel de estudos]] · [[fluxo-nova-feature|Fluxo de feature]]
