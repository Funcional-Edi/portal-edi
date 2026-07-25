# ADR-0001: `core/` (invariante) + `modules/` (bounded contexts)

- **Status:** Aceita
- **Data:** 2026-07-25

## Contexto

O portal é uma plataforma modular do time EDI: documentação viva (interna e
externa), fluxogramas, homologação, base de conhecimento e assistente de IA. O
projeto anterior organizava por camada técnica, o que dificultava adicionar
contextos novos sem espalhamento. O briefing exige separar invariante de
extensível, isolar bounded contexts e ter camadas claras.

## Decisão

Adotamos duas costuras:

- **`core/`** — invariantes compartilhados: `auth` (SSO), `config`, `db` (camada
  de dados), `errors`, `ai`, `events`, `module-registry`.
- **`modules/<contexto>/`** — cada bounded context isolado, com convenção
  `schema/ · repository/ · services/ · ui/` e um `module.ts` que declara o
  contrato (rota base, RBAC, público, capacidades de dados).

Regra de dependência: `app → modules → core`. `core/` não importa de `modules/`;
módulos não se importam entre si — comunicam-se por **eventos** (`core/events`).
Navegação, RBAC e a "planta viva" derivam do `module-registry`.

## Consequências

- **Mais fácil:** adicionar módulo = 1 pasta + registro; a landing e o
  `/api/health` listam módulos automaticamente.
- **Mais difícil:** exige disciplina de dependência entre camadas.
- **Revisar quando:** o número de módulos crescer a ponto de justificar
  empacotar cada um (monorepo com workspaces).
