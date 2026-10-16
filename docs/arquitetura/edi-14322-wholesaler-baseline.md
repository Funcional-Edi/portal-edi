# EDI-14322 — baseline local do Wholesaler (WE)

> Registro feito em 16/10/2026 antes de integrar a infraestrutura do editor BPMN da `codex/edi-14323-v2`.
> A fonte de verdade permanece nos arquivos de `content/projects/wholesaler/` listados abaixo.

## Objetivo do registro

Preservar a arquitetura e o conteúdo específico do WE enquanto o editor visual de fluxogramas passa a usar o mesmo modelo BPMN aplicado aos demais produtos. A integração não deve substituir o manual, as seções nem a lógica comercial do WE.

## Arquivos locais preservados

- `content/projects/wholesaler/config.json`
- `content/projects/wholesaler/manual.json`
- `content/projects/wholesaler/flow.json`
- `content/projects/wholesaler/sections/visao-geral.md`
- `content/projects/wholesaler/sections/seguranca-e-ferramentas.md`
- `content/projects/wholesaler/sections/regras-comerciais.md`
- `content/projects/wholesaler/sections/fluxo-do-pedido.md`

## Manual atual

- Produto: **Wholesaler — Pedido e recebimento**.
- Ambiente: **homolog**.
- Público: **distribuidor**.
- Operações: **15**.
- Roteiro de homologação: **1 fluxo** e **6 validações**.

### Catálogo de operações

1. `createToken`
2. `orders`
3. `setOrderAsImported`
4. `createResponse`
5. `order`
6. `createInvoice`
7. `createCancellation`
8. `responses`
9. `invoices`
10. `createBranchPrices`
11. `pricingsSearch`
12. `createInvoiceReversal`
13. `createDevolution`
14. `devolutions`
15. `devolution`

## Fluxograma atual

O fluxo `pedido-faturamento` descreve pedido criado pela Funcional, consulta e retorno do distribuidor, seguido de faturamento ou cancelamento.

- 2 raias: **WHOLESALER — DISTRIBUIDOR** e **WHOLESALER — FUNCIONAL**.
- 26 blocos e 26 transições.
- Decisão de aceite: **total**, **parcial** ou **rejeitado**.
- Decisão de faturamento: **nota fiscal** ou **cancelamento**.
- Estados finais: `REJECTED`, `CANCELLED` e `INVOICE_RECEIVED`.

## Regra de integração

Trazer apenas a infraestrutura comum do modelador BPMN — edição manual, setas, rótulos, anotações e persistência — mantendo o conteúdo e a topologia do WE acima. Um merge integral da `edi-14323-v2` removeria seções específicas do Wholesaler; por isso a integração deve ser seletiva.
