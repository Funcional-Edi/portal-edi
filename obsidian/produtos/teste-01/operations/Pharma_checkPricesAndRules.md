---
generated: true
project: teste-01
kind: query
name: Pharma_checkPricesAndRules
order: 2
---

# Pharma check prices and rules

**Operação:** `query.Pharma_checkPricesAndRules` · **Projeto:** [[produtos/teste-01/_index|teste-01]]

Consultar preço e regras

- **Auth no gateway:** sim

## Exemplo GraphQL

```graphql
query Pharma_checkPricesAndRules {
  Pharma_checkPricesAndRules(
    customerCode: ""
    origin: null
    products: [{ ean: "", medicalPrescription: null, price: 0, saleAmount: 0 }]
    storeCode: ""
  ) {
    aproved
    cardPaidValue
    createdAt
    moneyPaidValue
    products
    requiredUploadWithPrescription
    totalDiscountAmount
    totalValue
    totalValueMaxConsumerPrice
    totalValueWithoutPrescription
    totalValueWithPrescription
  }
}
```

---
↩ [[produtos/teste-01/_index|Voltar ao manual teste-01]]
