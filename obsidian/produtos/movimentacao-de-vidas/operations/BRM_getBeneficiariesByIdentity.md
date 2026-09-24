---
generated: true
project: movimentacao-de-vidas
kind: query
name: BRM_getBeneficiariesByIdentity
order: 4
---

# 4. Consultar beneficiário

**Operação:** `query.BRM_getBeneficiariesByIdentity` · **Projeto:** [[produtos/movimentacao-de-vidas/_index|movimentacao-de-vidas]]

Consulta os dados do beneficiário a partir do CPF informado.

## Pré-requisitos

- [[produtos/movimentacao-de-vidas/operations/createToken|createToken]]

## Seções relacionadas

- [[produtos/movimentacao-de-vidas/sections/visao-geral|visao-geral]]

## Exemplo GraphQL

```graphql
query BRM_getBeneficiariesByIdentity($beneficiaryIdentity: String!) {
  BRM_getBeneficiariesByIdentity(beneficiaryIdentity: $beneficiaryIdentity) {
    id
    name
    statusBeneficiary
  }
}
```

---
↩ [[produtos/movimentacao-de-vidas/_index|Voltar ao manual movimentacao-de-vidas]]
