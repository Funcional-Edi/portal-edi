---
generated: true
project: canal-autorizador
kind: query
name: groupedInvoiceDevolution
order: 12
---

# 12. Consultar uma devolução específica

**Operação:** `query.groupedInvoiceDevolution` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Consulta os dados de uma devolução de nota específica, pelo id do pedido devolvido ou pelo número da nota de devolução.

## Pré-requisitos

- [[produtos/canal-autorizador/operations/createGroupedInvoiceDevolution|createGroupedInvoiceDevolution]]

## Exemplo GraphQL

```graphql
query {
  groupedInvoiceDevolution(grouped_order_id: 233316) {
    invoice_devolution_created_at
    cfop
    danfe
    grouped_order_id
    status
    id
    invoice_number
    invoice_number_devolution
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
