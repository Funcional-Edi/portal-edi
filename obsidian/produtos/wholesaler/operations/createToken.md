---
generated: true
project: wholesaler
kind: mutation
name: createToken
order: 1
---

# 1. Obter token

**Operação:** `mutation.createToken` · **Projeto:** [[produtos/wholesaler/_index|wholesaler]]

Token para autenticar chamadas do fluxo wholesaler.

- **Auth no gateway:** não

## Exemplo GraphQL

```graphql
mutation createToken {
  createToken(login: "<login>", password: "<senha>") {
    token
  }
}
```

---
↩ [[produtos/wholesaler/_index|Voltar ao manual wholesaler]]
