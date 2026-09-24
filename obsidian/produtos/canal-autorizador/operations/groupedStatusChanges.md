---
generated: true
project: canal-autorizador
kind: query
name: groupedStatusChanges
order: 10
---

# 10. Consultar pedidos com status atualizado (stream)

**Operação:** `query.groupedStatusChanges` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Retorna os pedidos cujo status foi atualizado desde a última leitura, em vez de o distribuidor precisar consultá-los um a um.

## Pré-requisitos

- [[produtos/canal-autorizador/operations/createGroupedOrder|createGroupedOrder]]

## Seções relacionadas

- [[produtos/canal-autorizador/sections/fluxo-do-pedido|fluxo-do-pedido]]

## Notas de negócio

- Os registros recuperados nesta query são removidos da fila!
- Se não conseguir processar os registros por erro de rede ou qualquer outro problema, consulte os pedidos individualmente pela query groupedOrder.

## Exemplo GraphQL

```graphql
query groupedStatusChanges {
  groupedStatusChanges(limit: 50) {
    id
    status
    client_identification
    wholesaler
    total_products
    products {
      ean
      ordered_quantity
    }
    responses {
      status
      processed_at
      products {
        ean
        response_quantity
        importation_outcome
      }
    }
    invoices {
      processed_at
      status
      products {
        ean
        invoice_quantity
        importation_outcome
      }
    }
    cancellations {
      products {
        ean
        importation_outcome
      }
    }
    invoices_reversals {
      products {
        ean
        importation_outcome
      }
    }
  }
}
```

---
↩ [[produtos/canal-autorizador/_index|Voltar ao manual canal-autorizador]]
