# Diretrizes de Segurança e Consumo da API

- Consulte o estado do consentimento nos momentos previstos pelo processo antes de solicitar novo aceite.
- Envie os contatos somente quando autorizados e use dados sintéticos em homologação.
- Preserve `Status` e `Mensagem` retornados e não converta flags textuais sem validar seus valores.

> **ATENÇÃO MÁXIMA:** Mascare CPF, telefone, e-mail, tokens e credenciais em requisições compartilhadas e evidências.

> **COMENTÁRIO:** A referência indica envio de SMS e/ou e-mail, mas declara os dois contatos obrigatórios. A regra de envio por canal precisa ser confirmada antes de tratar um deles como opcional.
