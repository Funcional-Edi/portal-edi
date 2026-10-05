# Diretrizes de Segurança e Consumo da API

- Use `POINT_OF_SALES` para ponto de venda e `PARTNERS_ECOMMERCE` para e-commerce, conforme o cenário.
- Preserve `authorizationID`, `sequenceID`, datas e demais identificadores retornados para continuidade da transação.
- Use arquivo de receita de teste e mascare identificadores nas evidências.

> **ATENÇÃO MÁXIMA:** Não compartilhe token, credenciais, receita real ou dados pessoais em exemplos, logs e capturas de homologação.

> **OBSERVAÇÃO:** A pré-autorização tem validade máxima de 30 dias; recomenda-se confirmar a venda o quanto antes, idealmente no mesmo dia e no ponto de venda.
