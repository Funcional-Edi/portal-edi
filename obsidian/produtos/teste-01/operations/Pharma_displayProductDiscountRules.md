---
generated: true
project: teste-01
kind: query
name: Pharma_displayProductDiscountRules
order: 4
---

# Pharma display product discount rules

**Operação:** `query.Pharma_displayProductDiscountRules` · **Projeto:** [[produtos/teste-01/_index|teste-01]]

Consulta informações sobre as regras de desconto de um produto para exibição em uma interface gráfica

- **Auth no gateway:** sim

## Exemplo GraphQL

```graphql
query Pharma_displayProductDiscountRules {
  Pharma_displayProductDiscountRules(
    customerCode: ""
    detailed: false
    origin: null
    productEan: ""
    storeCode: ""
  ) {
    discounts
    messages
    nameProgram
    priority
    products
    status
    statusMessage
  }
}
```

---
↩ [[produtos/teste-01/_index|Voltar ao manual teste-01]]
