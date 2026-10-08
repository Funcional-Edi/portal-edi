# Contexto

O fluxo Opt-in verifica se o CPF aceitou os termos de consentimento e oferece dois caminhos: enviar o termo por SMS/e-mail ou exibi-lo na tela do parceiro para confirmação.

## Autenticação antes da jornada

Gere o token com `createToken` conforme a etapa inicial da Jornada da Integração e envie-o no header `Authorization` nas demais chamadas.
