---
generated: true
project: canal-autorizador
kind: query
name: groupedInvoiceDevolutions
order: 13
---

# 13. Consultar devoluções (paginado)

**Operação:** `query.groupedInvoiceDevolutions` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Consulta várias devoluções de nota, paginadas e com filtros por CFOP, DANFE, pedido, data e número da nota.

## Pré-requisitos

- [[produtos/canal-autorizador/operations/createGroupedInvoiceDevolution|createGroupedInvoiceDevolution]]

## Exemplo GraphQL

```graphql
query {
  groupedInvoiceDevolutions(page: 8, limit: 8, filter: {}) {
    data {
      grouped_order_id
      invoice_number
      invoice_number_devolution
      invoice_devolution_created_at
      cfop
      danfe
      status
      products {
        batch
        code_reason
        ean
        id
        importation_outcome
        quantity
        status
      }
    }
    total
    per_page
    current_page
    from
    to
    last_page
    has_more_pages
  }
}
```

---
↩ [[produtos/canal-autorizador/_index|Voltar ao manual canal-autorizador]]
