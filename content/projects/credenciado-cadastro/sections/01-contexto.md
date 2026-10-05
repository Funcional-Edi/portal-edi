# Contexto

O fluxo de Cadastro inscreve uma pessoa em um programa. A integração avalia a elegibilidade do CPF e do produto e usa a política retornada para decidir se deve inscrever o beneficiário, um dependente/paciente ou associar um produto.

## Autenticação antes da jornada

Obtenha o token por `createToken` antes das transações. A referência analisada cita a operação, mas não fornece seu tipo GraphQL nem o contrato completo; por isso, esta documentação não inventa esses detalhes nem replica o manual de autenticação.
