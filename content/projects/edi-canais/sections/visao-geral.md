# EDI Canais

Este manual reúne os produtos de **EDI Varejo** hoje documentados em
`developer.funcionalmais.com/docs/intro`: Gateway de Credenciado, Beneficiários,
Busca de Preço e Benefício Farmácia. Todos compartilham o **mesmo gateway
GraphQL** (`stores-uat.funcionalmais.com/graphql` em homologação), por isso
ficam agrupados em um único manual, com uma seção por tema.

## GraphQL

A integração usa GraphQL. Se você não conhece a tecnologia, veja a
documentação oficial ou os componentes por linguagem (.NET, Node.js, PHP)
citados no site legado.

### Queries e Mutations

- **Query**: consulta de informações, sem alterar nada no sistema (ex.: buscar
  se uma pessoa está inscrita em um programa).
- **Mutation**: altera ou cria informação (ex.: gerar uma pré-autorização,
  já que isso grava dado no banco).

### Tratamento de erros

Por ser uma camada acima do HTTP, os erros do GraphQL vêm no corpo da resposta
(`errors[]`), não no HTTP status code — diferente do padrão REST. Isso porque
uma mesma chamada pode combinar mais de um método, e um pode falhar enquanto
outro funciona. Exemplo de erro:

```json
{
  "errors": [
    {
      "message": "Field \"createToken\" argument \"password\" of type \"String!\" is required, but it was not provided.",
      "locations": [{ "line": 2, "column": 3 }],
      "extensions": { "code": "GRAPHQL_VALIDATION_FAILED" }
    }
  ]
}
```

## Autenticação (JWT)

A segurança usa o padrão JWT. O token deve ser enviado no header
`Authorization` da requisição, no formato `Bearer <token>`:

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Nunca exponha o token nem o compartilhe com terceiros.**

## Pendente

O texto acima é o conteúdo real da introdução do site legado. As seções por
tema (Credenciado, Beneficiários, Busca de Preço, Benefício Farmácia) ainda
estão como rascunho — o conteúdo detalhado de cada uma depende de:

1. Conectar o gateway real (`Conectar gateway`, na tela admin deste projeto).
2. Sincronizar o schema para revelar as queries/mutations disponíveis.
3. Receber o texto/print de cada página legada correspondente, para curar
   descrição e regras de negócio de cada operação.
