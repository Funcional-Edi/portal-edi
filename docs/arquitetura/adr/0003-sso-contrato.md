# ADR-0003: SSO reimplementado com o MESMO contrato do portal atual

- **Status:** Aceita
- **Data:** 2026-07-25

## Contexto

O portal anterior tem SSO funcional e testado. Como este é um projeto novo (do
zero), não reaproveitamos o código diretamente — mas o **fluxo de SSO é um
invariante** que não deve ser reinventado. A regra de ouro do domínio —
"SSO abre o portal; Gateway alimenta os manuais; nunca inverter as URLs" — foi o
risco crítico nº1 do projeto anterior.

## Decisão

- Reimplementamos o login SSO em `core/auth` preservando **o mesmo contrato**:
  autenticação via mutation `createToken(login, password)` no
  `FUNCIONAL_SSO_GRAPHQL_URL`; senha validada no login e **nunca persistida**;
  sessão JWT (8h) em cookie httpOnly; RBAC por `resolveRole`.
- Mantemos a taxonomia de erros de login (indisponível, inválido, bloqueado,
  MFA) idêntica à do portal atual.
- Provider `dev` (login sem senha) só monta em `NODE_ENV=development` com
  `DEV_AUTH_ENABLED=true` — **nunca** em produção.
- A distinção SSO ≠ Gateway ≠ token de integração é documentada e respeitada.

## Consequências

- **Mais fácil:** paridade comportamental com o SSO validado; menos risco de
  regressão de segurança.
- **Mais difícil:** exige testar o login SSO ponta a ponta antes do go-live
  (não coberto na fatia de fundação).
- **Não-objetivo:** mudar provider ou estratégia de sessão.
