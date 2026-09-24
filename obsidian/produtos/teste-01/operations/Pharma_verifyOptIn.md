---
generated: true
project: teste-01
kind: query
name: Pharma_verifyOptIn
order: 7
---

# Pharma verify opt in

**Operação:** `query.Pharma_verifyOptIn` · **Projeto:** [[produtos/teste-01/_index|teste-01]]

Consulta se um determinado beneficiário já aceitou os termos de um programa, e se esse aceite é obrigatório ou não.

- **Auth no gateway:** sim

## Exemplo GraphQL

```graphql
query Pharma_verifyOptIn {
  Pharma_verifyOptIn(
    input: { CNPJ: "", CodCre: 0, CPF: "", EAN: "", Origem: 0 }
    origin: null
  ) {
    Mensagem
    OptInObrigatorio
    OptInRealizado
  }
}
```

---
↩ [[produtos/teste-01/_index|Voltar ao manual teste-01]]
