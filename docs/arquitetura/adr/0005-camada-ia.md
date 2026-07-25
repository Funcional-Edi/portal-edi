# ADR-0005: Camada de IA desenhada no dia 1 (provedor único, guardrails, custo)

- **Status:** Aceita
- **Data:** 2026-07-25

## Contexto

A IA é central no produto (gerar manual do schema, resumir tickets, chat com
RAG, detectar breaking changes). O briefing (Princípio 8) exige: controle de
custo, proteção de dados sensíveis (não vazar segredos/dado interno), validação
de saída, começar com um provedor e medir custo por uso.

## Decisão

`core/ai` é a fachada única de IA:

- **Porta `AiProvider`** — troca de provedor (OpenAI/Anthropic/…) sem mudar quem
  consome. Começamos com um provedor `stub` (sem custo) e ligamos um real via
  `AI_PROVIDER` + `AI_API_KEY`.
- **Guardrails** — `redactSecrets` remove segredos da entrada antes de enviar ao
  provedor; `assertSafeOutput` valida a saída.
- **Custo** — `recordUsage`/`isOverBudget` medem custo por caso de uso e
  bloqueiam ao ultrapassar `AI_MONTHLY_BUDGET_USD`.
- **RAG** — porta `Retriever` para quando houver base de conhecimento indexada
  (índice vetorial exigirá banco — ver ADR-0002).

## Consequências

- **Mais fácil:** features de IA nascem com custo e segurança sob controle;
  provedor plugável.
- **Mais difícil:** custo/uso em memória perde estado entre instâncias —
  persistência real será um recurso que exige banco.
- **Revisar quando:** ligar o primeiro provedor real ou introduzir RAG.
