---
generated: true
project: teste-01
kind: query
name: Pharma_assessEligibility
order: 1
---

# Pharma assess eligibility

**Operação:** `query.Pharma_assessEligibility` · **Projeto:** [[produtos/teste-01/_index|teste-01]]

A partir de um CPF e EAN, avalia se o produto pertence à algum programa, e se o CPF precisa ser cadastrado no programa ou no produto específico

- **Auth no gateway:** sim

## Exemplo GraphQL

```graphql
query Pharma_assessEligibility {
  Pharma_assessEligibility(
    customerCode: ""
    origin: null
    productCode: ""
    storeCode: ""
  ) {
    dependents
    eligibilityAssessment
    registrationPolicy
    validationResult
  }
}
```

---
↩ [[produtos/teste-01/_index|Voltar ao manual teste-01]]
