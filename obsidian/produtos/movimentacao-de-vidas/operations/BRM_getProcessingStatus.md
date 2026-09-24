---
generated: true
project: movimentacao-de-vidas
kind: query
name: BRM_getProcessingStatus
order: 3
---

# 3. Consultar status do processamento

**Operação:** `query.BRM_getProcessingStatus` · **Projeto:** [[produtos/movimentacao-de-vidas/_index|movimentacao-de-vidas]]

Consulta o status atual da instrução enviada ao processamento assíncrono.

## Pré-requisitos

- [[produtos/movimentacao-de-vidas/operations/BRM_createOrUpdateBeneficiary|BRM_createOrUpdateBeneficiary]]

## Seções relacionadas

- [[produtos/movimentacao-de-vidas/sections/visao-geral|visao-geral]]

## Exemplo GraphQL

```graphql
query BRM_getProcessingStatus($id: String!) {
  BRM_getProcessingStatus(id: $id) {
    id
    status
    statusMessage
  }
}
```

---
↩ [[produtos/movimentacao-de-vidas/_index|Voltar ao manual movimentacao-de-vidas]]
