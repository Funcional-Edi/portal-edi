# Diretrizes de Segurança e Consumo da API

## Autenticação

Todas as operações exigem autenticação, exceto `createToken`. Solicite login e senha ao responsável pela homologação e mantenha esses valores fora do repositório, dos exemplos e dos logs.

O token deve ser enviado nas chamadas seguintes pelo cabeçalho:

```text
Authorization: Bearer <token>
```

A validade prevista do token é de 24 horas. Gere um novo token somente quando necessário para o período de uso.

## Teste com Altair

Os testes de requisição devem ser feitos no cliente de API **Altair**.

1. Baixe o cliente em [altair.sirmuel.design/#download](https://altair.sirmuel.design/#download).
2. Abra uma nova requisição e configure o método como `POST`.
3. Use o gateway de homologação:

```text
https://gateway-homologa.fidelize.com.br/graphql
```

4. Execute `createToken` com as credenciais fornecidas pelo responsável técnico.
5. Copie o token retornado para o cabeçalho `Authorization` e execute as demais operações.
6. Abra a documentação do schema no Altair. No schema, o símbolo `!` identifica campos obrigatórios.

Postman e Insomnia são alternativas de cliente. Os mesmos cuidados de endpoint, autenticação, variáveis e evidências devem ser aplicados.

## Exemplo de geração do token

Use somente placeholders em documentação e homologação compartilhada:

```graphql
mutation CreateToken($login: String!, $password: String!) {
  createToken(login: $login, password: $password) {
    token
  }
}
```

Variáveis:

```json
{
  "login": "<LOGIN_DE_HOMOLOGACAO>",
  "password": "<SENHA_DE_HOMOLOGACAO>"
}
```

## Validação do serviço

Valide `statusCode` e `statusMesage` no retorno geral, mantendo a grafia do contrato do Wholesaler. Em caso de falha, leia também o bloco padrão do GraphQL:

```json
{
  "errors": [
    {
      "message": "<mensagem>",
      "path": ["<campo>"],
      "extensions": {}
    }
  ]
}
```

Não considere uma operação concluída apenas porque a requisição HTTP retornou sucesso. Registre o status do serviço, a resposta GraphQL, o identificador da operação e o estado final do pedido.

No contrato do Wholesaler, o bloco `errors` deve ser tratado junto com `data`. Registre pelo menos `message` e `code` quando forem retornados; não considere a operação concluída apenas pela resposta HTTP.

Os cabeçalhos de limite de consumo devem ser lidos na resposta HTTP. O campo `Retry-After` indica quanto aguardar antes de uma nova tentativa; não repita a chamada em laço sem respeitar essa orientação.

## Limite de consumo

O limite do serviço é de **3000 requisições por minuto**. Acompanhe:

| Cabeçalho | Finalidade |
| --- | --- |
| `x-RateLimit-Limit` | Limite total configurado. |
| `x-RateLimit-Remaining` | Saldo de requisições disponível. |
| `Retry-After` | Tempo de espera antes de tentar novamente. |

## Certificado e dados de teste

Use certificado, credenciais e dados sintéticos conforme a orientação do responsável pela homologação. Não compartilhe token, senha, pedido real ou dado pessoal em captura de tela, log, exemplo ou PR.
