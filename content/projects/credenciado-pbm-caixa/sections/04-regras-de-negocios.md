# Regras de Negócios

- Validar elegibilidade e regras antes de pré-autorizar; o nome da operação de elegibilidade ainda não está confirmado para este fluxo.
- Em autorização parcial, criar nova autorização somente com os itens recusados e preservar `authorizationID`.
- Na confirmação, não adicionar produtos nem exceder as quantidades pré-autorizadas.
- Atualizar programas diariamente e conferir `allowedOrigins`, regras, preços, bloqueio e exigência de receita.
- No cancelamento repetido, preservar `statusCode 103` e `Transacao ja cancelada`.

> **ATENÇÃO:** Não confirme a venda usando produtos ou quantidades diferentes dos autorizados.

> **OBSERVAÇÃO:** A resposta do cancelamento deve ser apresentada com status, código, mensagem e recibo quando retornados.

> **COMENTÁRIO:** A operação oficial de elegibilidade e a tabela de origens PBM permanecem pendentes de confirmação; não as inferimos de outros fluxos.
