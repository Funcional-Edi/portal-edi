# Fluxo do pedido

O ciclo principal do Wholesaler começa quando a Funcional cria o pedido no portal e termina quando o pedido é faturado, cancelado ou rejeitado. O distribuidor executa as operações do gateway na ordem abaixo.

## 1. Consultar pedidos disponíveis

Use `orders` para consultar os pedidos ainda não importados. Para iniciar o roteiro, filtre `imported: false` e `status: ORDER_NOT_IMPORTED`. Preserve `order_code`, `industry_code` e os produtos retornados.

## 2. Marcar o pedido como importado

Depois de selecionar o pedido, use `setOrderAsImported`. Essa operação registra que o distribuidor assumiu o processamento e inicia a janela para o envio do retorno comercial.

## 3. Enviar o retorno comercial

Use `createResponse` em até uma hora após a importação. O retorno pode ser:

- aceito integralmente;
- aceito parcialmente, com os itens e quantidades aceitos;
- rejeitado, com o motivo de cada item recusado.

Preserve os identificadores e os dados de produto retornados pela operação.

## 4. Faturar o pedido

Quando o retorno for aceito, use `createInvoice` em até 48 horas. Envie somente as quantidades efetivamente faturadas. Se a mesma DANFE atender mais de um pedido, informe `invoice_item_id` para relacionar cada item ao pedido correto.

## 5. Cancelar o pedido

Quando o pedido não for faturado, use `createCancellation` depois do retorno comercial e antes do envio da nota fiscal. O cancelamento pode ser total ou parcial.

## 6. Acompanhar o processamento

Use `order`, `responses` e `invoices` para consultar o resultado e manter a rastreabilidade. Considere o status do pedido e o retorno geral da operação antes de avançar para a próxima etapa.

## 7. Operações complementares

- `createBranchPrices` e `pricingsSearch` tratam cargas de preço e estoque.
- `createInvoiceReversal` trata a reversão ou atualização de uma nota fiscal já enviada.
- `createDevolution`, `devolutions` e `devolution` tratam o envio e a consulta de devoluções.

## Regras de calendário

As janelas de uma hora para o retorno e de 48 horas para o faturamento devem ser contadas a partir dos eventos registrados no gateway. Em todos os caminhos, mantenha `order_code`, `industry_code` e os identificadores retornados para que o pedido possa ser consultado e auditado.
