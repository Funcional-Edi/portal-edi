---
generated: true
project: canal-autorizador
kind: mutation
name: createGroupedResponse
order: 4
---

# 4. Enviar retorno do pedido (opcional)

**Operação:** `mutation.createGroupedResponse` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Envia o retorno (aceite, rejeição ou aceite parcial) do pedido à Funcional, produto a produto.

## Pré-requisitos

- [[produtos/canal-autorizador/operations/createGroupedOrder|createGroupedOrder]]

## Seções relacionadas

- [[produtos/canal-autorizador/sections/fluxo-do-pedido|fluxo-do-pedido]]

## Notas de negócio

- O envio do retorno não é obrigatório — o distribuidor pode enviar direto o createGroupedInvoice.
- Há uma alteração no fluxo de envio das requisições ao usar o retorno: alinhe com o responsável pela homologação na Funcional antes de habilitar.
- Se o pedido já homologou o envio do retorno e você quer parar de enviá-lo (ou vice-versa), é necessário um realinhamento com a Funcional.
- Para o produto que não for atendido, envie 0 no campo response_quantity.

## Exemplo GraphQL

```graphql
mutation createGroupedResponse {
  createGroupedResponse(
    id: 587
    date_time_processing: "2025-05-06 10:00:00"
    order_motive: ORDER_SUCCESSFULLY_ACCEPTED
    products: [
      {
        ean: "5000456011624"
        response_quantity: 10
        percent_discount: 1
        unit_discount_price: 0.40
        unit_net_price: 40.00
        product_reason: PRODUCT_SUCCESSFULLY_ACCEPTED
        monitored: true
        wholesaler_reason: "PRODUCT_SUCCESSFULLY_ACCEPTED"
      }
      {
        ean: "7891000460214"
        response_quantity: 10
        percent_discount: 1
        unit_discount_price: 0.20
        unit_net_price: 30.00
        product_reason: PRODUCT_SUCCESSFULLY_ACCEPTED
        monitored: true
        wholesaler_reason: "PRODUCT_SUCCESSFULLY_ACCEPTED"
      }
    ]
    total_value: 39.20
    discount_value: 0.80
  ) {
    grouped_order_code
    client_identification
    wholesaler
    client_code
    commercial_condition
    status
    total_products
    products {
      ean
      ordered_quantity
      wholesaler_discount
      order_discount
      unit_net_price
      industry_order_code
      product_reason
      industry_abbreviation
    }
  }
}
```

---
↩ [[produtos/canal-autorizador/_index|Voltar ao manual canal-autorizador]]
