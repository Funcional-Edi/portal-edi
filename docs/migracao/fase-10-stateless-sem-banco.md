# Fase 10+ — decisão operacional: continuar sem banco

## Decisão

Mantemos ADR-0002 (**stateless-first**): nada de Redis, Postgres, SQLite ou outra
persistência operacional para a documentação viva nas fases 10+.

## O que entra

- Conteúdo em arquivos (`content/` + `data/`) via adapters existentes.
- APIs BFF server-side em `app/api/`.
- Métricas de playground continuam **in-memory** (voláteis por processo).

## O que não entra agora

- Persistência de métricas playground em banco.
- Sessões/transações de homologação com estado próprio.
- Dependência de infraestrutura de dados para fechar paridade do portal legado.

## Quando reconsiderar banco

Reavaliar apenas quando houver requisito explícito de **homologação transacional**
(rastreamento persistente de execução, auditoria forte por cliente ou retomada de
sessão entre deploys), com ADR nova antes de implementar.
