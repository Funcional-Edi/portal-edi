---
generated: true
project: teste-01
kind: query
name: Pharma_discountPrograms
order: 3
---

# Pharma discount programs

**Operação:** `query.Pharma_discountPrograms` · **Projeto:** [[produtos/teste-01/_index|teste-01]]

Consultar a base de programas da indústria e seus produtos a partir de um CNPJ

- **Auth no gateway:** sim

## Exemplo GraphQL

```graphql
query Pharma_discountPrograms {
  Pharma_discountPrograms(
    origin: null
    storeCode: ""
  ) {
    allowedOrigins
    id
    name
    rules
    url
  }
}
```

---
↩ [[produtos/teste-01/_index|Voltar ao manual teste-01]]
