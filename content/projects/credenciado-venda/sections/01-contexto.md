# Contexto

A pré-venda é uma autorização prévia, normalmente realizada no balcão, para negociação e consulta antes do caixa. A venda só é concluída após a confirmação no Gateway.

## Origem da venda

- Use `POINT_OF_SALES` para operações realizadas no ponto de venda (PDV).
- Use `PARTNERS_ECOMMERCE` para operações de e-commerce, conforme o cenário.

> **ATENÇÃO:**
>
> No PDV, a confirmação deve ser realizada no mesmo dia da pré-autorização.
>
> **Sobrescrição de pré-autorização não confirmada:** Quando uma pré-autorização anterior não tiver sido confirmada, uma nova tentativa de pré-autorização sobrescreverá a anterior. Nesse cenário, a nova pré-autorização passa a ser a referência válida para a continuidade do fluxo de venda; a autorização anterior deixa de ser utilizada para confirmação.

## Autenticação antes da jornada

Gere o token com `createToken` conforme a etapa inicial da Jornada da Integração e envie-o no header `Authorization` nas demais chamadas.
