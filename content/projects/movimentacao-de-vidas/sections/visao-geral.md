# Movimentação de Vidas

Este manual documenta o fluxo de integração do Gateway Companies para movimentação de beneficiários e colaboradores. O gateway recebe as instruções por GraphQL, valida os campos obrigatórios e coloca cada instrução em uma fila de processamento.

## Endereços

- Homologação: `https://companies-uat.funcionalhealthtech.com.br/graphql`
- Produção: `https://companies.funcionalhealthtech.com.br/graphql`

Use o endereço de homologação durante os testes. Credenciais e tokens devem ser fornecidos pelo responsável pela homologação e nunca devem ser gravados no repositório.

## Fluxo da integração

1. Execute `createToken` para obter o token de autenticação.
2. Envie a movimentação com `BRM_createOrUpdateBeneficiary` ou com a mutation específica do caso de negócio.
3. Guarde o `id` retornado pela instrução.
4. Consulte `BRM_getProcessingStatus` para acompanhar o processamento ou receba o resultado por webhook, quando o endpoint do cliente estiver configurado.

Dependentes só devem ser enviados depois do titular ou quando o titular já estiver cadastrado. Para consultas operacionais, `BRM_getBeneficiariesByIdentity` permite localizar um beneficiário por CPF.

## Autenticação e segurança

Todas as requisições devem usar o token no header `Authorization: Bearer <token>`. O mesmo token pode ser reutilizado até expirar. Nunca compartilhe credenciais, tokens ou dados pessoais em exemplos públicos.
