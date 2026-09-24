---
generated: true
project: canal-autorizador
kind: mutation
name: createGroupedCancellation
order: 6
---

# 6. Cancelar o pedido (parcial ou total)

**Operação:** `mutation.createGroupedCancellation` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Envia o cancelamento do pedido à Funcional, informando o id do pedido e cada produto a cancelar.

## Pré-requisitos

- [[produtos/canal-autorizador/operations/createGroupedResponse|createGroupedResponse]]

## Seções relacionadas

- [[produtos/canal-autorizador/sections/fluxo-do-pedido|fluxo-do-pedido]]

## Notas de negócio

- A requisição deve conter apenas os produtos que devem ser cancelados — o cancelamento pode ser parcial ou total. Produtos que não serão cancelados não devem constar na requisição.
- O cancelamento só pode ser enviado depois do envio do retorno e antes do faturamento (antes do envio da nota fiscal).

## Exemplo GraphQL

```graphql
mutation createGroupedCancellation {
  createGroupedCancellation(
    id: 587
    products: [
      { ean: "5000456011624" }
      { ean: "7891000460214" }
    ]
  ) {
    id
    status
  }
}
```

---
↩ [[produtos/canal-autorizador/_index|Voltar ao manual canal-autorizador]]
