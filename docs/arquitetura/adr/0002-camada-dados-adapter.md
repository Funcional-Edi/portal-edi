# ADR-0002: Stateless agora; banco só quando um recurso exigir (com alerta)

- **Status:** Aceita
- **Data:** 2026-07-25

## Contexto

O briefing sugere avaliar PostgreSQL. Decisão do responsável: **não introduzir
banco enquanto não for necessário**, mas ficar **preparado** e ser **alertado**
quando algo que formos implementar exigir banco. Conteúdo versionável
(documentação, manuais) não precisa de banco; módulos transacionais
(homologação, auditoria, RAG em escala) precisam.

## Decisão

- **Não** adicionamos banco nesta fase.
- `core/db` define a costura da camada de dados:
  - `DataCapability` (`content`, `transactional`, `audit-log`,
    `full-text-search`, `vector-search`, `queue`);
  - capacidades **disponíveis hoje**: apenas `content`;
  - `requireDatabase(feature, capability)` que **lança `DatabaseRequiredError`
    (alerta explícito)** quando um recurso pede capacidade indisponível;
  - a porta `DataStore`, que um adapter Postgres futuro implementa sem mudar os
    services.
- Cada módulo declara `requiresCapabilities`; `listBlockedModules()` e o
  `/api/health` mostram o que está bloqueado por falta de banco.

## Consequências

- **Mais fácil:** entregar sem sobre-engenharia; o alerta força decisão
  consciente quando um módulo transacional entrar.
- **Mais difícil:** ao ligar o banco, implementar adapter + migrations
  versionadas.
- **Gatilho de revisão:** primeiro `requireDatabase` disparado (provável em
  `homologacao` ou no RAG do `assistente-ia`). Avaliar PostgreSQL (relacional +
  JSONB + busca textual; extensão vetorial p/ RAG).
