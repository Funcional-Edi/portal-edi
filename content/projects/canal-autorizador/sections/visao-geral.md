# Visão geral

O **Canal Autorizador** (também chamado de *Transfer Order*) informa às indústrias (OLs)
os pedidos faturados pelos distribuidores. Toda a troca de informação é feita via **API
GraphQL**: o pedido é criado no portal da indústria somente depois que todas as questões
comerciais — como o desconto do produto — já foram validadas.

Diferente do PDF original, este manual é **documentação viva**: os campos e exemplos abaixo
são gerados a partir do schema real do gateway (via introspection GraphQL) sempre que o
projeto é sincronizado pelo time EDI, então eles nunca ficam desatualizados em relação à
API. Veja "Ver referência GraphQL" no topo do roteiro para navegar por todos os tipos e
campos do schema.

## Fluxo resumido

1. Autenticar (`createToken`) e obter o token JWT.
2. Criar o pré-pedido (`createGroupedOrder`).
3. Opcionalmente, enviar o retorno produto a produto (`createGroupedResponse`).
4. Enviar a nota fiscal do pedido (`createGroupedInvoice`).
5. Se necessário, cancelar (`createGroupedCancellation`), substituir a nota
   (`createGroupedInvoiceReversal`) ou devolver produtos (`createGroupedInvoiceDevolution`).
6. Acompanhar o pedido com `groupedOrder`, `groupedOrders` ou o stream `groupedStatusChanges`.

Veja o passo a passo completo — incluindo o fluxograma BPMN — na seção
[Fluxo do pedido](#section-fluxo-do-pedido).

## Necessidades

Assim que o distribuidor enviar uma requisição, ele deve **aguardar a atualização do
status do pedido** antes de continuar com a próxima requisição. Enviar requisições em
sequência, sem aguardar o processamento anterior, é a causa mais comum de pedidos
duplicados e inconsistências de status.

## Query e Mutation

A integração usa GraphQL:

- **Query**: consulta de informação, sem alterar nada no sistema (ex.: `groupedOrder`,
  `groupedOrders`).
- **Mutation**: altera ou cria informação (ex.: `createGroupedOrder`,
  `createGroupedInvoice`), já que grava dados no banco.

### Tratamento de erros

Por ser uma camada acima do HTTP, os erros do GraphQL vêm no corpo da resposta
(`errors[]`), e não no HTTP status code. Isso porque uma mesma chamada pode combinar mais
de um campo, e um pode falhar enquanto outro funciona. Exemplo de erro:

```json
{
  "errors": [
    {
      "message": "Field \"createGroupedOrder\" argument \"client_identification\" of type \"String!\" is required, but it was not provided.",
      "locations": [{ "line": 2, "column": 3 }],
      "extensions": { "code": "GRAPHQL_VALIDATION_FAILED" }
    }
  ]
}
```

O objeto `data` no corpo da resposta traz o retorno do tipo solicitado quando a requisição
é bem-sucedida.

## Domain experts

O Canal Autorizador é um processo técnico — por isso os detentores do conhecimento deste
domínio são do time de TI/EDI da Funcional:

| Papel | Responsabilidade |
|---|---|
| Gerência de TI | Direciona prioridade e escopo técnico do projeto. |
| Análise e desenvolvimento | Modelagem técnica e codificação do gateway GraphQL. |
| Análise de negócio | Modelagem funcional e regras de negócio do projeto. |
| Coordenação de EDI | Conhece os trâmites de negócio e homologação com distribuidores. |
