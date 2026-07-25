# ADR-0004: Núcleo TypeScript/Next.js; Python só como microserviço de IA quando exigir

- **Status:** Aceita
- **Data:** 2026-07-25

## Contexto

Avaliou-se migrar o portal para Python por causa do foco em IA. Análise:
consumir LLMs, RAG e embeddings é first-class em TypeScript (Vercel AI SDK,
LangChain.js, SDKs oficiais). Python só ganha claramente em ML custom / dados
pesados. O produto é uma UI de DX rica (playground, editor de fluxo, WYSIWYG,
markdown) — inerentemente JavaScript/React. Um rewrite total em Python
reescreveria o que funciona e ainda exigiria um frontend JS grande.

## Decisão

- **Núcleo do portal em TypeScript/Next.js** (App Router, BFF).
- **IA desenhada no dia 1** dentro do TS (ver ADR-0005).
- **Python entra apenas como microserviço** de IA/dados **quando** um workload
  justificar (RAG pesado, embeddings em escala) — mesma disciplina do banco
  (ADR-0002): não adiciona até um need real, com contrato claro entre serviços.

## Consequências

- **Mais fácil:** uma linguagem, um deploy no início; aproveita o ecossistema de
  DX; menor risco de regressão.
- **Mais difícil:** se surgir ML custom pesado, será preciso stand-up de um
  serviço Python e definir o contrato de integração (REST/fila).
- **Revisar quando:** aparecer um workload de IA/dados que o TS não atenda bem.
