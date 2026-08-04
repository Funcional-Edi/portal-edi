---
generated: true
project: im
kind: mutation
name: createToken
order: 1
---

# 1. Obter token do gateway

**Operação:** `mutation.createToken` · **Projeto:** [[produtos/im/_index|im]]

Autentica no gateway antes de enviar inventario.

- **Auth no gateway:** não

## Notas de negócio

- Token expira em 24h.
- Nunca reutilizar token de producao em homolog.

## Exemplo GraphQL

```graphql
mutation createToken {
  createToken(
    login: "<login>"
    password: "<senha>"
  ) {
    token
  }
}
```

---
↩ [[produtos/im/_index|Voltar ao manual im]]
