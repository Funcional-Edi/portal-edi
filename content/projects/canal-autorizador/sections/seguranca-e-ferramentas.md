# Segurança e ferramentas

## Autenticação

Todas as operações do serviço, exceto `createToken`, exigem autenticação. O token deve
ser enviado no header `Authorization` da requisição, no formato `Bearer <token>`:

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- O login e a senha do ambiente de homologação são solicitados ao responsável pela
  homologação na Funcional — nunca gravados em código, planilhas ou repositórios.
- O token é válido por **24 horas** e deve ser gerado apenas uma vez nesse período —
  gerar um novo token a cada requisição sobrecarrega o serviço sem necessidade.
- **Nunca exponha o token nem o compartilhe com terceiros.**

## Documentação de API's

Você pode testar as requisições com qualquer cliente GraphQL: **Altair**, **Postman** ou
**Insomnia**. A documentação interativa do schema (introspection) fica disponível no menu
"Docs" desses clientes, ao lado direito da tela, depois de configurar a URL e o header de
autenticação.

- **Download do Altair**: https://altair.sirmuel.design/#download
- Ao abrir o cliente, configure o método como `POST` e a URL do gateway de homologação:
  `https://gateway-homologa.fidelize.com.br/graphql`.
- No editor de texto, use a mutation abaixo para obter o token (veja também a operação
  "1. Autenticar" no roteiro deste manual):

```graphql
mutation createToken {
  createToken(login: "<login>", password: "<senha>") {
    token
  }
}
```

- Depois de copiar o token retornado, configure o header `Authorization` com o valor
  `Bearer <token>` (nos clientes de API isso costuma ficar em "Set Headers" ou "Headers").
- Ao abrir "Docs", clique nos campos para ver todos os campos que podem ou devem ser
  enviados. **Todos os campos marcados com ponto de exclamação (`!`) são obrigatórios.**
- Se tiver dificuldade para montar a chamada, o Postman ajuda a gerar o código em várias
  linguagens de programação a partir da mesma requisição — use a opção "Code" no cliente.

Nesta documentação viva, o mesmo schema fica disponível em "Ver referência GraphQL" (no
roteiro do manual), já navegável — sem precisar configurar um cliente externo para
explorar os tipos.

## Validações do serviço

Todas as operações seguem uma estratégia de validação com dois parâmetros em comum,
visíveis no *General Header* da resposta:

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `statusCode` | Integer | `0` = requisição válida; diferente de `0` = erro de validação, descrito em `statusMessage`. |
| `statusMessage` | String | Descrição referente ao código de retorno. |

## Limite do serviço (rate limit)

O gateway aplica um interceptor que limita a quantidade de chamadas por minuto. O limite
atual é de **3000 requisições por minuto**. Essas informações ficam no *Response Header*
da API:

| Parâmetro | Descrição |
|---|---|
| `X-RateLimit-Limit` | Limite de requisições por minuto. |
| `X-RateLimit-Remaining` | Número de requisições restantes no momento. |
| `Retry-After` | Tempo em segundos para o envio da próxima requisição. |

## Tratamento de erros

O serviço usa GraphQL, então os erros seguem o padrão da tecnologia — no corpo da
resposta, e não no HTTP status code:

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `errors` | Array | Array de objetos com `message` (mensagem) e `code` (código da mensagem). |
| `data` | Objeto | Objeto do tipo solicitado, quando a requisição é bem-sucedida. |
