---
generated: true
project: canal-autorizador
kind: mutation
name: createGroupedOrder
order: 2
---

# 2. Criar pré-pedido (Transfer Order)

**Operação:** `mutation.createGroupedOrder` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Cria um pré-pedido na Funcional com os produtos e a condição comercial do pedido faturado pelo distribuidor.

## Pré-requisitos

- [[produtos/canal-autorizador/operations/createToken|createToken]]

## Seções relacionadas

- [[produtos/canal-autorizador/sections/fluxo-do-pedido|fluxo-do-pedido]]

## Notas de negócio

- O pedido é criado no portal da indústria após a validação das questões comerciais (ex.: desconto do produto).
- Se o pedido tiver mais de um produto, a Funcional pode rejeitá-lo parcialmente — criando o pedido só com os produtos aceitos e rejeitando os demais por questões comerciais da indústria.
- O percentual de desconto deve ser enviado de acordo com o combinado com a indústria.
- industry_abbreviation só é obrigatório a depender da indústria (hoje apenas AstraZeneca, sigla AZN, exige o envio).

## Exemplo GraphQL

```graphql
mutation createGroupedOrder {
  createGroupedOrder(
    client_identification: "00000000000000"
    wholesaler: "00000000000000"
    client_code: "1234"
    commercial_condition: ""
    products: [
      { ean: "7891058003203", ordered_quantity: 1, wholesaler_discount: 50 }
      { ean: "7891058003241", ordered_quantity: 2, wholesaler_discount: 40 }
    ]
  ) {
    id
    grouped_order_code
    client_identification
    wholesaler
    client_code
    commercial_condition
    status
    total_products
  }
}
```

---
↩ [[produtos/canal-autorizador/_index|Voltar ao manual canal-autorizador]]
