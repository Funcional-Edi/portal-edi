---
generated: true
project: wholesaler
kind: mutation
name: createOrder
order: 2
---

# 2. Criar pedido

**Operação:** `mutation.createOrder` · **Projeto:** [[produtos/wholesaler/_index|wholesaler]]

Cria pedido no gateway com itens e dados do cliente.

## Pré-requisitos

- [[produtos/wholesaler/operations/createToken|createToken]]

## Seções relacionadas

- [[produtos/wholesaler/sections/regras-comerciais|regras-comerciais]]

## Notas de negócio

- Idempotencia por externalOrderId.
- Itens com quantidade zero sao rejeitados.

## Exemplo GraphQL

```graphql
mutation createOrder {
  createOrder(input: {
    externalOrderId: "PED-1001",
    customerCode: "CLI-900",
    items: [{ sku: "7891106001946", quantity: 10 }]
  }) {
    status
    orderId
    message
  }
}
```

---
↩ [[produtos/wholesaler/_index|Voltar ao manual wholesaler]]
