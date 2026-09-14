# Pontos importantes

Notas de negócio que não se encaixam em uma operação específica, mas que impactam a
integração como um todo:

- Quando o pedido estiver com o status `PROCESSED`, significa que foi **totalmente
  negado** e não deve ser processado pelo distribuidor — não envie nenhuma requisição
  adicional para este pedido.
- Nesse caso, valide com o KAM ou o comercial da Funcional o motivo pelo qual o pedido
  não foi criado. Depois do ajuste, envie o pedido novamente na API — isso gera um novo
  `id`.
- Ao enviar um pedido com mais de um produto, a Funcional pode **rejeitá-lo
  parcialmente**: criar o pedido apenas com os produtos aceitos e rejeitar os demais por
  questões comerciais da indústria.
- O percentual de desconto do pedido deve seguir exatamente o que foi combinado com a
  indústria.
- Use a query `groupedOrder` para acompanhar todos os pedidos enviados pelo Canal
  Autorizador — é o método de acompanhamento recomendado.
- Envie os pedidos no mesmo dia (D) ou no dia seguinte (D-1), conforme combinado com a
  indústria.
- O token da API é válido por 24 horas e deve ser gerado apenas uma vez nesse período.
