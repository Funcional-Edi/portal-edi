# Regras comerciais

## Janela de resposta

Depois de importar o pedido com `setOrderAsImported`, o distribuidor deve enviar o retorno em até **uma hora**. O retorno informa se o pedido foi aceito integralmente, aceito parcialmente ou rejeitado.

## Faturamento e cancelamento

- A resposta comercial não representa faturamento concluído.
- `createInvoice` deve ser enviada depois do retorno aceito e em até **48 horas**.
- O faturamento pode ser total ou parcial; envie somente as quantidades efetivamente faturadas.
- `createCancellation` deve ser enviada depois de `createResponse` e antes de `createInvoice`; pode cancelar todos os itens ou apenas parte deles.
- Em caso de aceite parcial, mantenha os itens recusados e seus motivos no retorno.
- A resposta por produto deve preservar as quantidades, os valores e a consideração de cada item. Não trate um retorno parcial como faturamento concluído.

## Identificadores e nota fiscal

Preserve os identificadores retornados por cada operação. Quando a mesma DANFE atender mais de um pedido, informe `invoice_item_id` nos produtos da mutation `createInvoice` para relacionar corretamente cada item ao pedido.

## Preços, estoque e devolução

- `createBranchPrices` envia preço e estoque por filial; `pricingsSearch` consulta o processamento da carga.
- `createInvoiceReversal` atualiza ou reverte uma nota fiscal já enviada.
- `createDevolution` envia a devolução; `devolution` e `devolutions` consultam o resultado.

## Limite do serviço

O gateway aceita até **3000 requisições por minuto**. Registre os cabeçalhos abaixo quando houver controle de consumo ou necessidade de nova tentativa:

| Cabeçalho | Uso |
| --- | --- |
| `x-RateLimit-Limit` | Limite configurado para o serviço. |
| `x-RateLimit-Remaining` | Quantidade de requisições restantes. |
| `Retry-After` | Tempo, em segundos, para aguardar antes da próxima requisição. |

## Validação de retorno

Valide `statusCode` e `statusMesage` no retorno geral do serviço, preservando a grafia definida no contrato. Além disso, trate o formato padrão do GraphQL: `errors`, `message`, `code` e `data`.

## Evidências de homologação

Registre a requisição, a resposta, os identificadores e o status final de cada cenário. Use apenas placeholders ou dados sintéticos autorizados; nunca compartilhe credenciais, tokens ou dados pessoais reais.
