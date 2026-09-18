---
generated: true
project: canal-autorizador
kind: mutation
name: createGroupedInvoiceReversal
order: 8
---

# 8. Substituir a nota fiscal enviada

**Operação:** `mutation.createGroupedInvoiceReversal` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Substitui os dados de uma nota já enviada por uma nova nota, informando o número da nota a remover e os dados completos da nova nota.

## Pré-requisitos

- [[produtos/canal-autorizador/operations/createGroupedInvoice|createGroupedInvoice]]

## Seções relacionadas

- [[produtos/canal-autorizador/sections/fluxo-do-pedido|fluxo-do-pedido]]

## Notas de negócio

- Informe o número da nota que deseja substituir em removed_invoices e, em new_invoices, todos os dados da nota nova (não apenas o que mudou).

## Exemplo GraphQL

```graphql
mutation createGroupedInvoiceReversal {
  createGroupedInvoiceReversal(
    grouped_order_id: 587
    removed_invoices: [351523]
    new_invoices: [
      {
        date_time_processing: "2025-05-06 10:00:00"
        invoice_issue_date: "2025-05-06"
        invoice_number: 351524
        danfe: "BFG102141515"
        invoice_value: 175.00
        invoice_discount_value: 0.00
        products_total_value: 175.00
        invoice_products: [
          { ean: "5000456011624", invoice_quantity: 1, percent_discount: 0.00 }
          { ean: "7891000460214", invoice_quantity: 2, percent_discount: 0.00 }
        ]
      }
    ]
  ) {
    id
    grouped_order_code
    client_identification
    commercial_condition
    client_code
    status
    total_products
    products {
      ean
      ordered_quantity
    }
    invoices {
      processed_at
      number
      danfe
      value
      status
      products {
        ean
        invoice_quantity
      }
    }
  }
}
```

---
↩ [[produtos/canal-autorizador/_index|Voltar ao manual canal-autorizador]]
