---
generated: true
project: movimentacao-de-vidas
kind: mutation
name: createToken
order: 1
---

# 1. Criar token

**Operação:** `mutation.createToken` · **Projeto:** [[produtos/movimentacao-de-vidas/_index|movimentacao-de-vidas]]

Autentica o cliente no gateway e retorna o token usado nas chamadas seguintes.

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
↩ [[produtos/movimentacao-de-vidas/_index|Voltar ao manual movimentacao-de-vidas]]
