# Fluxo do pedido

O ciclo de vida de um pedido no Canal Autorizador passa por até cinco requisições, na
ordem abaixo. O fluxograma BPMN completo (com o ponto de decisão do retorno opcional)
está disponível em "Ver fluxograma", no topo deste manual.

## 1. Pré-pedido

O distribuidor cria o pedido com `createGroupedOrder`, informando cliente, filial,
condição comercial e produtos. A Funcional valida as regras comerciais (desconto,
condição, cadastro do produto/cliente) e cria o pedido no portal da indústria — podendo
**rejeitar produtos individualmente** dentro do mesmo pedido.

- Se o pedido inteiro for rejeitado, o `status` retorna `PROCESSED`. Nesse caso, **não
  envie nenhuma requisição adicional para este pedido**: valide com o KAM ou o comercial
  da Funcional o motivo da rejeição e, após o ajuste, envie o pedido novamente (o novo
  envio gera um novo `id`).
- Use a query `groupedOrder` para acompanhar o processamento — o campo
  `product_reason` de cada produto indica o motivo e, quando aplicável, a ação que o
  distribuidor deve tomar (veja a tabela de referência "Motivo do produto na consulta").

## 2. Retorno (opcional)

O distribuidor pode enviar o retorno do pedido com `createGroupedResponse`, indicando
produto a produto o que foi aceito, parcialmente aceito ou rejeitado. **Esta etapa não é
obrigatória** — é possível ir direto para a nota fiscal —, mas muda o fluxo esperado pelo
gateway, então qualquer mudança (habilitar ou desabilitar o retorno) precisa ser alinhada
com o time de homologação da Funcional.

## 3. Nota fiscal

O distribuidor envia a nota fiscal com `createGroupedInvoice`. Se o pedido tiver mais de
uma nota, o retorno da etapa anterior passa a ser **obrigatório**. Se um produto não for
faturado, envie `0` no campo `invoice_quantity` — não é necessário cancelar esse produto.

Depois de enviada, a nota pode ser:

- **Substituída** por uma nova nota com `createGroupedInvoiceReversal` (ex.: erro nos
  dados fiscais).
- **Parcial ou totalmente devolvida** com `createGroupedInvoiceDevolution` (ex.: produto
  devolvido pelo cliente final).

## 4. Cancelamento

O cancelamento (`createGroupedCancellation`) só pode ser enviado **depois do retorno e
antes do faturamento** — ou seja, antes de qualquer nota fiscal ser enviada para o
pedido. Pode ser parcial (só os produtos cancelados na lista) ou total.

## Acompanhamento

Três formas de consultar o andamento dos pedidos, dependendo do caso de uso:

| Consulta | Quando usar |
|---|---|
| `groupedOrder` | Acompanhar um pedido específico, pelo `id`. É a forma recomendada de acompanhamento contínuo. |
| `groupedOrders` | Buscar pedidos por filtro (status, filial, cliente, condição comercial, data), paginado. |
| `groupedStatusChanges` | Receber um "stream" dos pedidos cujo status mudou — os registros são **removidos da fila** ao serem lidos; em caso de falha de rede, consulte o pedido individualmente com `groupedOrder`. |

## Regras de calendário

O distribuidor deve encaminhar os pedidos no mesmo dia (D) ou no dia seguinte (D-1), de
acordo com o que foi combinado com a indústria.
