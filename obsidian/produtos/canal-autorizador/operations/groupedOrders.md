---
generated: true
project: canal-autorizador
kind: query
name: groupedOrders
order: 9
---

# 9. Consultar pedidos por filtro

**Operação:** `query.groupedOrders` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Consulta pedidos do Canal Autorizador paginados, filtrando por status, filial, condição comercial, cliente e data.

## Pré-requisitos

- [[produtos/canal-autorizador/operations/createGroupedOrder|createGroupedOrder]]

## Notas de negócio

- O parâmetro limit não deve passar de 200 registros por página.

## Exemplo GraphQL

```graphql
query {
  groupedOrders(page: 1, limit: 10, filter: { status: AWAITING_ORDER_RESPONSE }) {
    total
    per_page
    current_page
    from
    to
    last_page
    has_more_pages
    data {
      id
      status
      products {
        ean
        ordered_quantity
      }
      responses {
        products {
          ean
          importation_outcome
          product_status
          product_reason
          response_quantity
        }
      }
      invoices {
        products {
          ean
          invoice_quantity
          status
          importation_outcome
        }
      }
      grouped_devolutions {
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
    }
  }
}
```

---
↩ [[produtos/canal-autorizador/_index|Voltar ao manual canal-autorizador]]
