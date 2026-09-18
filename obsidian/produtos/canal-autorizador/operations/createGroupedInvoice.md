---
generated: true
project: canal-autorizador
kind: mutation
name: createGroupedInvoice
order: 5
---

# 5. Enviar a nota fiscal do pedido

**Operação:** `mutation.createGroupedInvoice` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Envia os dados da nota fiscal (DANFE, valores, impostos e produtos faturados) do pedido à Funcional.

## Pré-requisitos

- [[produtos/canal-autorizador/operations/createGroupedOrder|createGroupedOrder]]

## Seções relacionadas

- [[produtos/canal-autorizador/sections/fluxo-do-pedido|fluxo-do-pedido]]

## Notas de negócio

- Pode ser enviada direto para um pedido sem retorno (createGroupedResponse). Se um produto não for faturado, envie 0 no campo invoice_quantity — nesse caso não há envio de cancelamento para ele.
- Se o pedido for faturado com mais de uma nota, o envio do retorno (createGroupedResponse) se torna obrigatório.
- O campo invoice_item_id é obrigatório quando a mesma DANFE é usada em mais de um pedido na Funcional. O valor pode repetir entre DANFEs diferentes, mas não pode repetir dentro da mesma DANFE. Se não for enviado nesse cenário, a nota não será processada.

## Exemplo GraphQL

```graphql
mutation createGroupedInvoice {
  createGroupedInvoice(
    id: 587
    invoice_issue_date: "2025-05-06"
    date_time_processing: "2025-05-06 07:36:57"
    invoice_number: 351523
    invoice_value: 3039
    invoice_discount_value: 0
    products_total_value: 3039
    danfe: "35152306123456000100550010000001234567890000"
    invoice_products: [
      {
        ean: "5000456011624"
        invoice_quantity: 10
        unit_net_price: 2.640
        unit_discount_price: 0
        percent_discount: 0
        product_total_value: 2.640
      }
      {
        ean: "7891000460214"
        invoice_quantity: 10
        unit_net_price: 2.640
        unit_discount_price: 0
        percent_discount: 0
        product_total_value: 2.640
      }
    ]
  ) {
    id
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
