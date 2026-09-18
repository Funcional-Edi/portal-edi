---
generated: true
project: canal-autorizador
kind: mutation
name: createGroupedInvoiceDevolution
order: 11
---

# 11. Enviar a devolução da nota

**Operação:** `mutation.createGroupedInvoiceDevolution` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Registra a devolução de produtos de uma nota já enviada, informando o produto devolvido, o lote e os dados da nova nota de devolução.

## Pré-requisitos

- [[produtos/canal-autorizador/operations/createGroupedInvoice|createGroupedInvoice]]

## Seções relacionadas

- [[produtos/canal-autorizador/sections/fluxo-do-pedido|fluxo-do-pedido]]

## Exemplo GraphQL

```graphql
mutation {
  createGroupedInvoiceDevolution(
    input: {
      grouped_order_id: 123456
      invoice_number: 321654
      invoice_number_devolution: "07042025001"
      invoice_devolution_created_at: "2025-04-07"
      danfe: "TESTE"
      cfop: "TESTE"
      products: [
        { ean: "0000000000004", quantity: 3, batch: "f", code_reason: "201" }
      ]
    }
  ) {
    invoice_number_devolution
    invoice_number
    grouped_order_id
    invoice_devolution_created_at
    cfop
    danfe
    status
    products {
      id
      ean
      batch
      quantity
      code_reason
      status
      importation_outcome
    }
  }
}
```

---
↩ [[produtos/canal-autorizador/_index|Voltar ao manual canal-autorizador]]
