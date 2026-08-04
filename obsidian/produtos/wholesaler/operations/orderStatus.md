---
generated: true
project: wholesaler
kind: query
name: orderStatus
order: 3
---

# 3. Consultar status do pedido

**Operação:** `query.orderStatus` · **Projeto:** [[produtos/wholesaler/_index|wholesaler]]

Consulta o status de processamento por orderId.

## Pré-requisitos

- [[produtos/wholesaler/operations/createOrder|createOrder]]

## Exemplo GraphQL

```graphql
query orderStatus {
  orderStatus(orderId: "GW-123456") {
    status
    updatedAt
    message
  }
}
```

---
↩ [[produtos/wholesaler/_index|Voltar ao manual wholesaler]]
