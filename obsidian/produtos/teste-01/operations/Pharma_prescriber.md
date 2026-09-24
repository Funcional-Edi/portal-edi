---
generated: true
project: teste-01
kind: query
name: Pharma_prescriber
order: 5
---

# Pharma prescriber

**Operação:** `query.Pharma_prescriber` · **Projeto:** [[produtos/teste-01/_index|teste-01]]

Consulta um prescritor existe ativamente

- **Auth no gateway:** sim

## Exemplo GraphQL

```graphql
query Pharma_prescriber {
  Pharma_prescriber(
    data: { council: null, registerNumber: 0, stateAbbr: "" }
  ) {
    errors
    message
    status
  }
}
```

---
↩ [[produtos/teste-01/_index|Voltar ao manual teste-01]]
