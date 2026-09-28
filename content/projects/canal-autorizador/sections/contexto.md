# Contexto

O projeto Canal Autorizador disponibiliza às OLs as informações dos pedidos
faturados pelos distribuidores por meio de integração via API. Os pedidos são
criados no portal da indústria após a validação das condições comerciais
aplicáveis, como descontos de produtos e demais regras de negociação.

Por se tratar de uma integração tecnológica, o suporte técnico da integração é
de responsabilidade das equipes de TI envolvidas.

## Regras de entrada

- Os pedidos são criados após a validação das regras comerciais.
- A integração é realizada exclusivamente por API.
- O distribuidor deve aguardar a atualização do status do pedido antes de
  enviar a próxima requisição.

## Fluxo resumido

Distribuidor envia pedido → Funcional valida regras comerciais → Pedido é criado
no portal da indústria → Integrações subsequentes seguem conforme o status
processado.
