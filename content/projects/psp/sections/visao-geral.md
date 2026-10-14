# PSP — Acompanhamento de Pacientes

Documentação de integração com os serviços de **PSP** (acompanhamento de
pacientes) da Funcional, organizada neste portal.

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

O texto acima apresenta o contexto do produto neste portal. A lista de
endpoints (método, caminho, corpo de exemplo) ainda está pendente: falta
conectar a URL real da API pela tela **Conectar API**, no admin deste projeto,
e consolidar as operações a partir das chamadas reais.
