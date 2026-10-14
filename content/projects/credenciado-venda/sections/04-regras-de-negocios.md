# Regras de Negócios

- Pré-autorização não representa venda concluída; a confirmação finaliza a venda.
- Se um item for inválido, apresente todas as condições antes de continuar; em autorização parcial, crie nova autorização somente com os itens recusados.
- A confirmação não pode incluir produtos novos nem quantidade superior à pré-autorizada.
- Se uma pré-autorização posterior for confirmada, a anterior não pode ser confirmada.
- Sem `preAuthorizationDate`, considerar somente pré-autorizações do mesmo dia.
- Em cancelamento repetido, conservar `statusCode 103` e `Transacao ja cancelada`.

> **ATENÇÃO:** Não considere a venda aprovada quando houver item inválido; trate o status de cada produto e solicite nova autorização apenas dos itens recusados.

> **OBSERVAÇÃO:** `dailyDose` deve ser solicitado quando `requiredInformDailyDose` indicar necessidade; essa condição é relevante para compras com receita.
