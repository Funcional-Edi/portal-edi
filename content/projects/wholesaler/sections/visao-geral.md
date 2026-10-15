# Visão geral

O Wholesaler (WE) é o gateway GraphQL usado para integrar o distribuidor ao ciclo de pedidos da Funcional. O pedido nasce no portal da Funcional; o distribuidor consulta os pedidos disponíveis, importa o pedido, informa o retorno comercial e envia a nota fiscal, o cancelamento ou os processos complementares.

## Participantes

- **Funcional:** cria o pedido, disponibiliza os dados para consulta, recebe o retorno comercial e processa faturamento, cancelamento, preços, notas e devoluções.
- **Distribuidor:** consulta e importa pedidos, envia o aceite total, parcial ou a rejeição e acompanha o processamento.
- **Equipe EDI:** fornece as credenciais de homologação, valida as evidências e aprova o cenário.

## Responsáveis pelo projeto

- **Bruno Lima:** gerente de TI.
- **Victor Machado:** analista e desenvolvedor responsável pelas modelagens técnicas e pela codificação.
- **Renato Filizzola:** analista responsável pela modelagem e construção do projeto.
- **Gleice Azevedo:** coordenadora de EDI.

## Documentação e ferramentas

Os testes de requisição devem ser realizados preferencialmente no cliente **Altair**. O download está disponível em [altair.sirmuel.design/#download](https://altair.sirmuel.design/#download). Postman e Insomnia podem ser usados como clientes alternativos quando necessário.

O fluxo de teste, a autenticação, o endereço do gateway e as regras de segurança estão descritos em [Diretrizes de Segurança e Consumo da API](#). Não use credenciais, tokens, pedidos ou dados pessoais reais nos exemplos ou nas evidências.

## Sequência principal

1. Gere o token com `createToken`. O token deve ser criado uma vez por período e enviado nas chamadas seguintes como `Authorization: Bearer <token>`.
2. Consulte `orders` filtrando `imported: false` e `status: ORDER_NOT_IMPORTED`.
3. Marque o pedido como importado com `setOrderAsImported`. Preserve `order_code` e `industry_code`.
4. Envie `createResponse` em até uma hora após a importação: aceite total, aceite parcial ou rejeição, com os motivos, quantidades e considerações de produto correspondentes.
5. Para um retorno aceito, envie `createInvoice` em até 48 horas. O faturamento pode ser total ou parcial e deve conter somente as quantidades efetivamente faturadas.
6. Se o pedido não for faturado, envie `createCancellation` depois do retorno comercial e antes da nota fiscal.
7. Acompanhe o resultado com `order`, `responses` e `invoices`. O ciclo termina nos estados `INVOICE_RECEIVED`, `CANCELLED` ou `REJECTED`.

## Operações complementares

- **Preços e estoque:** envie com `createBranchPrices` e acompanhe com `pricingsSearch`.
- **Nota fiscal:** consulte com `invoices` e atualize ou reverta com `createInvoiceReversal`.
- **Devolução:** envie com `createDevolution`, consulte uma ocorrência com `devolution` e a lista com `devolutions`.
- **Rastreabilidade:** mantenha os identificadores retornados em todas as etapas; não descarte o código do pedido, da nota, da carga ou da devolução.

## Estados do pedido

O distribuidor deve considerar os estados `ORDER_NOT_IMPORTED`, `AWAITING_RESPONSE`, `AWAITING_INVOICE`, `INVOICE_RECEIVED`, `CANCELLED` e `REJECTED` ao acompanhar o pedido.

## Homologação

Use o gateway e as credenciais fornecidos pelo responsável pela homologação. Os cenários devem ser executados no Altair, com requisição, resposta, identificadores e status final registrados para validação da equipe EDI.
