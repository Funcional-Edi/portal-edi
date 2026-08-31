# PSP — Acompanhamento de Pacientes

Documentação de integração com os serviços de **PSP** (acompanhamento de
pacientes) da Funcional. Migrado de
`developer.funcionalmais.com/docs/psp`.

## REST

Diferente dos demais produtos de EDI Varejo (que usam GraphQL), o PSP expõe
uma **API REST**. Não há playground GraphQL disponível para este manual —
use um cliente HTTP (Insomnia, Postman, curl) para testar as requisições.

## Autenticação (JWT)

A segurança usa o padrão JWT. O token deve ser enviado no header
`Authorization` da requisição, no formato `Bearer <token>`:

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Nunca exponha o token nem o compartilhe com terceiros.**

## Pendente

O texto acima é o conteúdo real da introdução do site legado. A lista de
endpoints (método, caminho, corpo de exemplo) ainda não foi migrada — falta
receber o print/texto da documentação detalhada de cada endpoint do PSP, ou
a URL real da API para conectar (tela **Conectar API**, no admin deste
projeto) e curar as operações a partir das chamadas reais.
