# Fase 5 - Smoke SSO homolog

Checklist manual para validar o fluxo distribuidor com SSO no ambiente homolog.

## Pre-condicoes

- `FUNCIONAL_SSO_GRAPHQL_URL` apontando para homolog.
- Projeto `im` publicado em `content/projects/im/config.json`.
- Gateway homolog acessivel.

## Passos

1. Acessar `/manual` sem sessao e confirmar redirect para `/login`.
2. Entrar com usuario distribuidor homolog.
3. Validar exibicao do catalogo com `IM - Inventario (homolog)`.
4. Abrir roteiro `/manual/im` e confirmar secoes + operacoes.
5. Abrir `mutation/createToken` e validar exemplo GraphQL.
6. Abrir playground e executar query allowlisted.
7. Executar operacao nao allowlisted e confirmar `403`.

## Resultado esperado

- Fluxo completo sem erro de autorizacao.
- Conteudo do IM com paridade funcional em relacao ao portal antigo.
