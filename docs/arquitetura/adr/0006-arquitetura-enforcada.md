# ADR-0006: Arquitetura verificada por máquina + estratégia de testes

- **Status:** Aceita
- **Data:** 2026-07-26

## Contexto

A ADR-0001 define a regra de dependência `app → modules → core` e o isolamento
entre bounded contexts. O problema conhecido de toda arquitetura documentada é
que ela **apodrece**: com prazo apertado, alguém importa um módulo de dentro de
outro, `core` passa a conhecer um módulo, e em poucos meses a estrutura vira
apenas um desenho no README que não corresponde ao código.

Documentação e revisão de código não são suficientes — dependem de disciplina
humana constante.

## Decisão

Tornamos a arquitetura **executável e verificada no CI**:

- **`dependency-cruiser`** (`.dependency-cruiser.cjs`, `npm run arch`) valida:
  - `core/` não depende de `modules/` nem de `app/`;
  - `modules/` não depende de `app/`;
  - **nenhum módulo importa outro módulo** (exceto `modules/registry.ts`, que só
    faz o wiring central) — a comunicação é por eventos (`core/events`);
  - ausência de dependências circulares e de imports não resolvidos;
  - código de produção não depende de `devDependencies`.
- **`vitest`** (`npm run test`, `npm run test:coverage`) para testes unitários,
  com os testes ao lado do código (`*.test.ts`).
- O pipeline `npm run ci` executa, nesta ordem: **typecheck → lint → arch →
  test → build**. Qualquer violação quebra o build (verificado: o comando retorna
  código de saída 1).

Prioridade de teste: **services e fundação primeiro** (lógica pura, alto valor,
fácil de testar); UI e integração entram com E2E em fase posterior.

## Consequências

- **Mais fácil:** a estrutura não pode degradar silenciosamente; o novo
  integrante recebe o erro exato no lugar de uma revisão subjetiva.
- **Mais difícil:** exceções legítimas exigem alterar a regra explicitamente —
  o que é desejável, pois vira decisão consciente e revisável.
- **Revisar quando:** surgir necessidade real de comunicação síncrona entre
  módulos (avaliar contrato explícito em `core/` antes de relaxar a regra).
