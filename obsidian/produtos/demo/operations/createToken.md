---
generated: true
project: demo
kind: mutation
name: createToken
order: 1
---

# 1. Obter token

**Operação:** `mutation.createToken` · **Projeto:** [[produtos/demo/_index|demo]]

Autentique no gateway antes de saveInventories. Token válido 24h.

- **Auth no gateway:** não

## Notas de negócio

- Use credenciais master do gateway (não o SSO do portal).
- Homologação usa gateway-homologa; produção usa gateway.fidelize.com.br.

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
↩ [[produtos/demo/_index|Voltar ao manual demo]]
