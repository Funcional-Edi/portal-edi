# Contexto

O projeto Canal Autorizador disponibiliza às OLs as informações dos pedidos
faturados pelos distribuidores por meio de integração via API. Os pedidos são
criados no portal da indústria após a validação das condições comerciais
aplicáveis, como descontos de produtos e demais regras de negociação.

Por se tratar de uma integração tecnológica, o suporte técnico da integração é
de responsabilidade das equipes de TI envolvidas.

## Regras de entrada

- O pedido é criado no portal da indústria após a validação das condições comerciais, como o desconto do produto.
- O percentual de desconto enviado deve corresponder ao que foi combinado com a indústria.
- `industry_abbreviation` só é obrigatório conforme a indústria; atualmente, a AstraZeneca (`AZN`) exige esse campo.
- O pedido deve ser enviado no mesmo dia da operação (D) ou no dia seguinte (D+1), conforme o acordo com a indústria.
- A integração é realizada exclusivamente por API.
- Após cada requisição, aguarde a atualização do status antes de enviar a próxima. O envio em sequência sem aguardar o processamento é uma causa comum de pedidos duplicados e inconsistências de status.

## Rejeições e reenvio

- Se todos os produtos forem rejeitados, o pedido retornará com status `PROCESSED`. Não envie novas requisições para esse pedido. Valide o motivo com o KAM ou com a equipe comercial da Funcional; após os ajustes, envie um novo pedido, que receberá outro identificador.
- Em pedidos com vários produtos, a Funcional pode aprovar alguns e rejeitar outros por regras comerciais. Valide os itens rejeitados com o KAM ou com a equipe comercial da Funcional e, após os ajustes, envie um novo pedido contendo somente esses itens.

## Fluxo resumido

Distribuidor envia pedido → Funcional valida regras comerciais → Pedido é criado
no portal da indústria → Integrações subsequentes seguem conforme o status
processado.
