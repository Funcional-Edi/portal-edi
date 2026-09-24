---
generated: true
project: movimentacao-de-vidas
kind: mutation
name: BRM_createOrUpdateBeneficiary
order: 2
---

# 2. Enviar movimentação

**Operação:** `mutation.BRM_createOrUpdateBeneficiary` · **Projeto:** [[produtos/movimentacao-de-vidas/_index|movimentacao-de-vidas]]

Enfileira a inclusão, atualização, reativação ou transferência do beneficiário conforme a situação atual do cadastro.

## Pré-requisitos

- [[produtos/movimentacao-de-vidas/operations/createToken|createToken]]

## Seções relacionadas

- [[produtos/movimentacao-de-vidas/sections/visao-geral|visao-geral]]

## Notas de negócio

- Envie primeiro a instrução do titular quando houver dependentes.
- A resposta contém o identificador da instrução; guarde-o para acompanhar o processamento.

## Exemplo GraphQL

```graphql
mutation BRM_createOrUpdateBeneficiary($input: BRM_BeneficiaryDetailInput!) {
  BRM_createOrUpdateBeneficiary(input: $input) {
    id
    status
    statusMessage
  }
}
```

---
↩ [[produtos/movimentacao-de-vidas/_index|Voltar ao manual movimentacao-de-vidas]]
