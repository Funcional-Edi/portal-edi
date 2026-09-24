---
generated: true
project: teste-01
kind: query
name: Prescription_prescriber
order: 8
---

# Prescription prescriber

**Operação:** `query.Prescription_prescriber` · **Projeto:** [[produtos/teste-01/_index|teste-01]]

- **Auth no gateway:** sim

## Exemplo GraphQL

```graphql
query Prescription_prescriber {
  Prescription_prescriber(
    council: null
    enrollment: ""
    fu: ""
  ) {
    active
    council
    enrollment
    fu
    name
  }
}
```

---
↩ [[produtos/teste-01/_index|Voltar ao manual teste-01]]
