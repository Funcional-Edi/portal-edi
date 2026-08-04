---
generated: true
project: demo
kind: mutation
name: saveInventories
order: 2
---

# 2. Enviar carga de estoque

**Operação:** `mutation.saveInventories` · **Projeto:** [[produtos/demo/_index|demo]]

Informe estoques às indústrias. Até 500 produtos por requisição.

## Pré-requisitos

- [[produtos/demo/operations/createToken|createToken]]

## Notas de negócio

- Máximo 500 produtos por requisição — divida cargas maiores.
- Produtos sem estoque: supply: 0.

## Exemplo GraphQL

```graphql
mutation saveInventories {
  saveInventories(
    industryCode: "FAB"
    inventories: [
      {
        referenceDate: "2026-07-01"
        customerCode: "00000000000000"
        customerType: WHOLESALER
        productCode: "7891106001946"
        supply: 400
        operationType: INSERT
      }
    ]
  ) {
    status
    loadId
    message
  }
}
```

---
↩ [[produtos/demo/_index|Voltar ao manual demo]]
