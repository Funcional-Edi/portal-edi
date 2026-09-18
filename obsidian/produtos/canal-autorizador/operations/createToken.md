---
generated: true
project: canal-autorizador
kind: mutation
name: createToken
order: 1
---

# 1. Autenticar (obter token)

**Operação:** `mutation.createToken` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Autentica no gateway do Canal Autorizador e retorna o token JWT que deve ser enviado no header Authorization das demais requisições.

- **Auth no gateway:** não

## Seções relacionadas

- [[produtos/canal-autorizador/sections/seguranca-e-ferramentas|seguranca-e-ferramentas]]

## Notas de negócio

- O token é válido por 24 horas e deve ser gerado apenas uma vez nesse período.
- Login e senha são solicitados ao responsável pela homologação na Funcional — nunca compartilhe essas credenciais.
- Nunca reutilize token de produção em homologação, nem exponha o token a terceiros.

## Exemplo GraphQL

```graphql
mutation createToken {
  createToken(login: "<login>", password: "<senha>") {
    token
  }
}
```

---
↩ [[produtos/canal-autorizador/_index|Voltar ao manual canal-autorizador]]
