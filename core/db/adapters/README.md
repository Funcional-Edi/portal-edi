# `core/db/adapters/` — Implementações de persistência

Placeholder reservado para adapters concretos quando um banco for introduzido
(ver ADR-0002). Ex.: `postgres.ts`, `redis-queue.ts`.

Até lá, a fundação permanece stateless e sinaliza módulos bloqueados via
`requireDatabase()` / `listBlockedModules()`.
