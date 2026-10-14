# Contexto

O fluxo PBM no Caixa combina elegibilidade, validação de regras, pré-autorização, confirmação, atualização fiscal, carga de programas e cancelamento. Mantém regras próprias para origem, faturamento e quantidade de itens.

## Autenticação e elegibilidade

Obtenha token por `createToken` antes das operações. A página de origem descreve avaliação de CPF e EAN, mas não identifica a operação. A jornada registra essa etapa como pendente até validação oficial.
