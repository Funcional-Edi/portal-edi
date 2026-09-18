---
generated: true
slug: canal-autorizador
published: true
---

# Integração Canal Autorizador — Transfer Order

| Campo | Valor |
| --- | --- |
| Slug | `canal-autorizador` |
| Produto | Canal Autorizador |
| Versão manual | 1.7.0 |
| Ambiente | homolog |
| Publicado | sim |
| GraphQL | https://gateway-homologa.fidelize.com.br/graphql |

Transfer Order: informa às indústrias (OLs) os pedidos faturados pelos distribuidores via GraphQL. Substitui o processo manual do PDF por documentação viva conectada ao gateway.

## Roteiro (operações)

1. [[produtos/canal-autorizador/operations/createToken|1. Autenticar (obter token)]]
2. [[produtos/canal-autorizador/operations/createGroupedOrder|2. Criar pré-pedido (Transfer Order)]]
3. [[produtos/canal-autorizador/operations/groupedOrder|3. Consultar um pedido]]
4. [[produtos/canal-autorizador/operations/createGroupedResponse|4. Enviar retorno do pedido (opcional)]]
5. [[produtos/canal-autorizador/operations/createGroupedInvoice|5. Enviar a nota fiscal do pedido]]
6. [[produtos/canal-autorizador/operations/createGroupedCancellation|6. Cancelar o pedido (parcial ou total)]]
7. [[produtos/canal-autorizador/operations/groupedInvoices|7. Consultar o ressarcimento]]
8. [[produtos/canal-autorizador/operations/createGroupedInvoiceReversal|8. Substituir a nota fiscal enviada]]
9. [[produtos/canal-autorizador/operations/groupedOrders|9. Consultar pedidos por filtro]]
10. [[produtos/canal-autorizador/operations/groupedStatusChanges|10. Consultar pedidos com status atualizado (stream)]]
11. [[produtos/canal-autorizador/operations/createGroupedInvoiceDevolution|11. Enviar a devolução da nota]]
12. [[produtos/canal-autorizador/operations/groupedInvoiceDevolution|12. Consultar uma devolução específica]]
13. [[produtos/canal-autorizador/operations/groupedInvoiceDevolutions|13. Consultar devoluções (paginado)]]

## Tabelas de referência

### Códigos de identificação das indústrias

| Indústria / Projeto | Código |
| --- | --- |
| Homologação | FAB |
| Abbott | ABT |
| Abbott ANI | ABI |
| Apsen | APS |
| AstraZeneca | AZN |
| AstraZeneca Institucional | AZI |
| Bayer | BAY |
| Bausch | BSH |
| Biogen | BGN |
| Celgene | CGN |
| Esanofi | ESA |
| Haleon | HLN |
| Knight | KNG |
| MSD | MSD |
| Nestlé | NTE |
| Organon | ORG |
| Pfizer | PFZ |
| Produtos sem OL | PSO |
| Reckitt | RCK |
| Roche | RCH |
| Sankyo | SKO |
| Saúde Petrobras | DLV (homologação e produção) |
| Sanofi | SAN |
| Servier | SVR |
| Viatris | UPJ |

### Status do pedido (campo status, em groupedOrder / groupedOrders / groupedStatusChanges)

| Status | Tradução |
| --- | --- |
| AWAITING_PROCESSING | Aguardando processamento |
| PROCESSING | Processando |
| PROCESSED | Pedido processado e totalmente rejeitado (negado) pela indústria |
| AWAITING_ORDER_RESPONSE | Aguardando o retorno do pedido |
| AWAITING_ORDER_INVOICE | Aguardando a nota do pedido |
| INVOICE_RECEIVED | Nota recebida |
| AWAITING_CANCELLATION_PROCESSING | Aguardando processamento do cancelamento |
| PROCESSING_CANCELLATION | Cancelamento sendo processado |
| AWAITING_INVOICE_REVERSAL_PROCESSING | Aguardando processamento da nota reversal |
| PROCESSING_INVOICE_REVERSAL | Nota reversal sendo processada |
| CANCELLED | Pedido cancelado |
| REJECTED | Pedido rejeitado |
| AWAITING_INVOICE_DEVOLUTION_PROCESSING | Aguardando processamento da devolução |
| PROCESSING_INVOICE_DEVOLUTION | Nota de devolução sendo processada |
| RETURNED | Devolvido |
| PARTIALLY_RETURNED | Parcialmente devolvido |

### Motivo do produto na consulta (campo product_reason, retornado por groupedOrder)

| Product Reason | Tradução | Ação do distribuidor |
| --- | --- | --- |
| AWAITING_PROCESSING | Aguardando processamento | Consultar o pedido novamente |
| ORDER_CREATED_ON_INDUSTRY_OL_PORTAL | Pedido criado no portal da indústria | Seguir com o pedido |
| NO_RESPONSE_FROM_INDUSTRY_OL_PORTAL | Sem resposta no portal da indústria | Enviar o pedido novamente, pois o portal estava fora do ar |
| PRODUCT_DOES_NOT_BELONG_TO_OL_FIDELIZE | Produto não existe na OL Funcional | Desconsiderar este item, pois não pertence à Funcional |
| PRODUCT_DOES_NOT_BELONG_TO_SELECTED_INDUSTRY | Produto não existe na indústria selecionada | Verificar com o KAM o motivo de não ter sido criado |
| PRODUCT_NOT_RELEASED_ON_COMMERCIAL_CONDITION | Produto não existe na condição comercial | Verificar com o KAM o motivo de não ter sido criado |
| COMMERCIAL_POLICIES_NOT_AVAILABLE_FOR_ORDER_CONDITIONS | Política comercial não disponível para a condição | Verificar com o KAM o motivo de não ter sido criado |
| COMMERCIAL_POLICIES_NOT_FOUND_FOR_PRODUCT_ON_INDUSTRY_OL_PORTAL | Nenhuma política comercial encontrada para o produto | Verificar com o KAM o motivo de não ter sido criado |
| WHOLESALER_DISCOUNT_REQUIRED | Desconto requerido | Verificar com o KAM o motivo de não ter sido criado |
| WHOLESALER_DISCOUNT_OUT_OF_RANGE | Desconto fora de alcance | Verificar com o KAM o motivo de não ter sido criado |
| PRODUCT_DISABLED_ON_INDUSTRY_OL_PORTAL | Produto desabilitado no portal da indústria | Desconsiderar este item, pois o produto está desabilitado |
| CLIENT_NOT_FOUND_ON_INDUSTRY_OL_PORTAL | Cliente não encontrado no portal da indústria | Entrar em contato com o KAM para cadastro |
| WHOLESALER_BRANCH_NOT_AVAILABLE_FOR_ORDER_CONDITIONS | Nenhuma condição comercial liberada para a filial do distribuidor | Entrar em contato com o KAM para cadastro |
| WHOLESALER_BRANCH_NOT_ALLOWED_TO_INDUSTRY | Filial não existe na indústria | Entrar em contato com o KAM para cadastro |
| PRODUCTS_NOT_AVAILABLES | Produto não disponível | Desconsiderar este item, pois não pertence à Funcional |
| ERROR_ADDING_PRODUCT_TO_ORDER | Erro ao adicionar produto no pedido | Verificar com o KAM o motivo de não ter sido criado |
| ERROR_SENDING_ORDER | Erro ao enviar pedido | Verificar com a Funcional se pode enviar novamente o pedido |
| DISCOUNT_OUT_OF_PERMITED_RANGE | Desconto fora do permitido | Verificar com o KAM o motivo de não ter sido criado |
| DUPLICATE_ORDER_ON_INDUSTRY_OL_PORTAL | Pedido duplicado | Verificar com a Funcional qual o tempo de espera para enviar pedido duplicado |
| RETROACTIVE_ORDER_NOT_AVAILABLE_FOR_WHOLESALER_BRANCH | Pedido retroativo não disponível para a filial do distribuidor | Verificar com a Funcional se o envio de pedidos retroativos está liberado para a filial |
| ORIGIN_NOT_ALLOWED_FOR_ORDER_DATE_RETROACTIVE | Origem não permitida para data de pedido retroativa | Verificar com a Funcional se o envio de pedidos retroativos está liberado |
| DATE_RANGE_NOT_DEFINED | Intervalo de datas não definido | Verificar junto à Funcional a data para envio de pedidos retroativos |
| ORDER_DATE_OUT_OF_RANGE | Data do pedido fora do intervalo | Verificar junto à Funcional a data para envio de pedidos retroativos |
| COMMERCIAL_POLICIES_NOT_AVAILABLE_FOR_CLIENT | Políticas comerciais não disponíveis para o cliente | Verificar com o KAM a tabela correta |
| COMMERCIAL_POLICIES_NOT_AVAILABLE_FOR_WHOLESALER | Políticas comerciais não disponíveis para o distribuidor | Verificar com o KAM a tabela correta |
| COMMERCIAL_POLICIES_NOT_AVAILABLE_FOR_PRODUCT | Políticas comerciais não disponíveis para o produto | Verificar com o KAM quais produtos estão liberados na tabela |
| WHOLESALER_BRANCH_NOT_FOUND_ON_INDUSTRY_OL_PORTAL | Filial do distribuidor não encontrada no portal da indústria | Verificar junto à Funcional a liberação da filial |
| DISTRIBUTOR_NOT_ASSOCIATED_WITH_THE_CUSTOMER | Distribuidor não associado ao cliente | Verificar junto à Funcional a liberação do cliente para o distribuidor |
| ORDER_REJECTED_DUE_TO_ONE_OR_MORE_DISCOUNTS_OUTSIDE_COMMERCIAL_POLICY | Pedido rejeitado devido a um ou mais descontos fora da política comercial | Verificar com o KAM os descontos corretos |
| PRODUCT_DISCOUNT_NOT_CONFIGURED_IN_POLICY | Desconto do produto não configurado na política | Verificar junto à Funcional se há desconto configurado |
| ERROR_ON_CREATE_ORDER | Erro ao criar o pedido | Verificar junto à Funcional o motivo do pedido não ter sido criado |
| ORDERED_QUANTITY_BELOW_REQUIRED | Quantidade encomendada abaixo do necessário | Verificar junto à Funcional a quantidade mínima da tabela |
| ORDERED_QUANTITY_ABOVE_MAXIMUM | Quantidade encomendada acima do máximo | Verificar junto à Funcional a quantidade máxima da tabela |

### Motivo do pedido no retorno do distribuidor (campo order_motive, em createGroupedResponse)

| Código | Motivo |
| --- | --- |
| BELOW_THE_MINIMUM | Abaixo do mínimo |
| PARTIALLY_BILLED_ORDER | Pedido pago parcialmente |
| ORDER_SUCCESSFULLY_ACCEPTED | Pedido aceito com sucesso |
| STOCK_SHORTAGE | Falta de estoque |
| CREDIT_SHORTAGE | Critério de crédito |
| CLIENT_NOT_REGISTERED | Cliente não registrado |
| TIME_EXCEEDED | Tempo excedido |
| CLIENT_AND_OR_PRODUCT_NOT_REGISTERED_ON_NEGOTIATION | Cliente e/ou produto não registrado na negociação |
| DUPLICATE_ORDER | Pedido duplicado |
| LICENSE_DATE_EXPIRED | Data de licença expirada |
| REGISTRATION_PROBLEMS | Problemas de registro |
| CLIENT_BLOCKED | Cliente bloqueado |
| INVALID_PAYMENT_CONDITION | Condição de pagamento inválida |
| LOGISTICAL_OPERATION_NOT_ALLOWED | Funcionamento logístico não permitido |
| CLIENT_NOT_REGISTERED_ON_PROMOTION | Cliente não registrado na negociação |
| INVALID_LAYOUT | Layout inválido |
| ORDER_BILLED_WITH_DIFFERENT_CONDITION | Pedido faturado em condições diferentes |

### Motivo do produto no retorno do distribuidor (campo product_reason, em createGroupedResponse)

| Product Reason | Tradução |
| --- | --- |
| PRODUCT_SUCCESSFULLY_ACCEPTED | Produto aceito com sucesso |
| PRODUCT_NOT_REGISTERED | Produto não registrado |
| PARTIALLY_ACCEPTED_PRODUCT | Produto parcialmente aceito |
| UNBILLED_PRODUCT | Produto não faturado |
| STOCK_SHORTAGE | Falta de estoque |
| PRODUCT_BLOCKED | Produto bloqueado |
| DISCONTINUED_PRODUCT | Produto descontinuado |
| INVALID_ORDERED_AMOUNT | Quantidade inválida |
| CLIENT_AND_OR_PRODUCT_NOT_REGISTERED_ON_NEGOTIATION | Cliente ou produto não registrado na negociação |
| PRODUCT_BLOCKED_BY_BRIEF_EXPIRATION_DATE | Produto bloqueado por data de expiração |
| PRODUCT_BLOCKED_FOR_THIS_OPERATION | Produto bloqueado para esta operação |
| PRODUCT_BLOCKED_CLINICAL | Produto clínico bloqueado |
| PRODUCT_BLOCKED_BY_PRICE_DIVERGENCE | Produto bloqueado por divergência de preço |
| PRODUCT_BLOCKED_BY_LOGISTICS | Produto bloqueado por logística |
| PRODUCT_NOT_REGISTERED_ON_PROMOTION | Produto não registrado na promoção |

### Código de motivo do produto (campo code_reason, em createGroupedInvoiceDevolution)

| Código | Motivo |
| --- | --- |
| 000 | Produto aceito com sucesso |
| 001 | Produto não cadastrado |
| 003 | Produto parcialmente aceito |
| 004 | Produto não faturado |
| 201 | Falta no estoque |
| 202 | Produto bloqueado |
| 205 | Produto descontinuado |
| 206 | Quantidade pedida inválida |
| 304 | Cliente e/ou produto não cadastrado na negociação |
| 504 | Produto bloqueado por validade curta |
| 601 | Produto bloqueado para esta operação |
| 602 | Produto bloqueado (hospitalar) |
| 603 | Produto bloqueado por divergência de preço |
| 604 | Produto bloqueado pela logística |
| 704 | Produto não cadastrado na promoção |

### Parâmetros de validação (General Header)

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| statusCode | Integer | 0 = requisição válida; diferente de 0 = código de erro de validação, descrito em statusMessage |
| statusMessage | String | Descrição referente ao código de retorno |

### Limite de requisições — Rate limit (Response Header)

| Parâmetro | Descrição |
| --- | --- |
| X-RateLimit-Limit | Limite de requisições por minuto (atualmente 3000 requisições/min) |
| X-RateLimit-Remaining | Número de requisições restantes no momento |
| Retry-After | Tempo em segundos para o envio da próxima requisição |

## Histórico de versão

- **1.0** (2018-04-24) — Equipe EDI: Especificação inicial do layout.
- **1.1** (2019-11-11) — Wanderson Macedo: Adicionado o campo product_reason_detail na query groupedOrder.
- **1.2** (2020-02-19) — Renato Filizzola: Adicionado novo motivo à tabela de motivos retornados no campo product_reason (groupedOrder): DUPLICATE_ORDER_ON_INDUSTRY_OL_PORTAL.
- **1.3** (2020-03-09) — Renato Filizzola: Adicionado o campo invoice_item_id na mutation createGroupedInvoice.
- **1.4** (2020-04-10) — Raphael Costa: Retirada a obrigatoriedade da requisição createGroupedResponse. O distribuidor pode enviar direto o createGroupedInvoice; para o produto não atendido, enviar 0 em invoice_quantity.
- **1.5** (2020-11-03) — Eden Meireles: Adicionada a query groupedOrders, para consultar pedidos do Canal Autorizador por client_identification, wholesaler_branch_code, status e date.
- **1.6** (2025-03-20) — Fabio Cardoso: Adicionada a mutation de envio da devolução (createGroupedInvoiceDevolution) e as queries de consulta (groupedInvoiceDevolution e groupedInvoiceDevolutions).
- **1.7** (2026-04-29) — Equipe EDI: Adicionados novos motivos à tabela de motivos retornados no campo product_reason (groupedOrder): RETROACTIVE_ORDER_NOT_AVAILABLE_FOR_WHOLESALER_BRANCH, ORIGIN_NOT_ALLOWED_FOR_ORDER_DATE_RETROACTIVE, DATE_RANGE_NOT_DEFINED, ORDER_DATE_OUT_OF_RANGE, COMMERCIAL_POLICIES_NOT_AVAILABLE_FOR_CLIENT, COMMERCIAL_POLICIES_NOT_AVAILABLE_FOR_WHOLESALER, COMMERCIAL_POLICIES_NOT_AVAILABLE_FOR_PRODUCT, WHOLESALER_BRANCH_NOT_FOUND_ON_INDUSTRY_OL_PORTAL, DISTRIBUTOR_NOT_ASSOCIATED_WITH_THE_CUSTOMER, ORDER_REJECTED_DUE_TO_ONE_OR_MORE_DISCOUNTS_OUTSIDE_COMMERCIAL_POLICY, PRODUCT_DISCOUNT_NOT_CONFIGURED_IN_POLICY, ERROR_ON_CREATE_ORDER, ORDERED_QUANTITY_BELOW_REQUIRED, ORDERED_QUANTITY_ABOVE_MAXIMUM.

## Seções (Markdown)

_Edite em `content/projects/canal-autorizador/sections/` — atualiza aqui automaticamente._

↩ [[00-MAPA-PORTAL|Mapa do portal]]
