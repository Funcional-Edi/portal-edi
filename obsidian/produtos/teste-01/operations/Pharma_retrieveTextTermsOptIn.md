---
generated: true
project: teste-01
kind: query
name: Pharma_retrieveTextTermsOptIn
order: 6
---

# Pharma retrieve text terms opt in

**Operação:** `query.Pharma_retrieveTextTermsOptIn` · **Projeto:** [[produtos/teste-01/_index|teste-01]]

Consulta os termos de aceite de determinado programa, seu link e código de envio para o beneficiário informado.

- **Auth no gateway:** sim

## Exemplo GraphQL

```graphql
query Pharma_retrieveTextTermsOptIn {
  Pharma_retrieveTextTermsOptIn(
    input: { CPF: "", Ean: "", Origem: 0 }
    origin: null
  ) {
    CodigoEnvio
    LinkTermos
    Mensagem
    Status
    TextoTermos
  }
}
```

---
↩ [[produtos/teste-01/_index|Voltar ao manual teste-01]]
