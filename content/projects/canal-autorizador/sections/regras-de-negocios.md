# Regras de Negócios

## Contexto e objetivo

Documentar as regras de negócios que devem ser seguidas pelo distribuidor.

## Regras existentes

- O pedido é criado no portal da indústria após a validação das questões comerciais, como o desconto do produto.
- O percentual de desconto deve ser enviado de acordo com o combinado com a indústria.
- `industry_abbreviation` só é obrigatório conforme a indústria; atualmente, apenas a AstraZeneca (`AZN`) exige o envio.

## Rejeições e reenvio

- Se o pedido for rejeitado integralmente, retornará com status `PROCESSED`. Não envie novas requisições para esse pedido. O distribuidor deve validar o motivo com o KAM ou com a equipe comercial da Funcional e, após os ajustes, enviar um novo pedido, que receberá um novo identificador.
- Quando o pedido possuir mais de um produto, a Funcional poderá criar o pedido apenas com os produtos aprovados e rejeitar os demais por regras comerciais da indústria. O distribuidor deve validar os itens rejeitados com o KAM ou com a equipe comercial da Funcional e enviar um novo pedido contendo exclusivamente esses itens.

## Envio e acompanhamento

- Os pedidos devem ser enviados no mesmo dia da operação (D) ou no dia seguinte (D+1), conforme o acordo estabelecido com a indústria.
- Após enviar uma requisição, aguarde a atualização do status do pedido antes de continuar com a próxima. Enviar requisições em sequência, sem aguardar o processamento anterior, é a causa mais comum de pedidos duplicados e inconsistências de status.
