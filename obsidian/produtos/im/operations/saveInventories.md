---
generated: true
project: im
kind: mutation
name: saveInventories
order: 2
---

# 2. Enviar carga de estoque

**Operação:** `mutation.saveInventories` · **Projeto:** [[produtos/im/_index|im]]

Envia ate 500 itens por requisicao para o gateway.

## Pré-requisitos

- [[produtos/im/operations/createToken|createToken]]

## Seções relacionadas

- [[produtos/im/sections/visao-geral|visao-geral]]
- [[produtos/im/sections/janela-processamento|janela-processamento]]

## Notas de negócio

- Cargas acima de 500 itens devem ser quebradas em lotes.
- Para indisponivel, enviar supply: 0.

## Exemplo GraphQL

```graphql
mutation saveInventories {
  saveInventories(
    industryCode: "FAB"
    inventories: [
      {
        referenceDate: "2026-08-20"
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
↩ [[produtos/im/_index|Voltar ao manual im]]
