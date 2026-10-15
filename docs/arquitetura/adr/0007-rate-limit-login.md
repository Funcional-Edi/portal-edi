# ADR-0007: Rate limit no login SSO (proteção contra força bruta)

- **Status:** Aceita
- **Data:** 2026-07-26

## Contexto

O `core/auth/sso.ts` original (Fase 1) validava credenciais direto contra o
SSO corporativo sem nenhum limite de tentativas — qualquer cliente poderia
tentar senhas indefinidamente contra `FUNCIONAL_SSO_GRAPHQL_URL`. O portal
anterior (`documentacao-funcional`) já resolveu esse problema em produção
(`lib/auth/login-rate-limit.ts`): 10 tentativas por 15 minutos, com backend
Redis REST opcional e fallback em memória. Reinventar essa proteção do zero,
ou pior, não ter nenhuma, seria repetir um risco já identificado e corrigido
no projeto anterior.

## Decisão

Portamos o mesmo mecanismo para `core/auth`:

- `core/auth/rate-limit.ts` — `checkLoginRateLimit(key)` /
  `resetLoginRateLimit(key)`, 10 tentativas / 15 min por chave (e-mail
  normalizado).
- `core/auth/redis-rest.ts` — cliente REST opcional (Upstash-compatível via
  `KV_REST_API_URL` / `KV_REST_API_TOKEN`). Sem essas variáveis, cai para
  memória local — a proteção nunca desliga, só perde durabilidade entre
  instâncias/serverless.
- `validateSsoCredentials` verifica o limite **antes** de chamar o SSO e
  reseta o contador após login bem-sucedido; bloqueio vira
  `SsoRateLimitError` (mesma família `CredentialsSignin`).

## Consequências

- **Mais fácil:** o login SSO fica protegido desde o primeiro módulo
  `active` — não existe uma janela de tempo em produção sem essa defesa.
- **Mais difícil:** nenhuma — a interface é a mesma, só quem chama
  `validateSsoCredentials` ganha a proteção automaticamente.
- **Atualização (EDI-14353, fase 1):** o limite agora conta por e-mail (10) **e**
  por IP (30) em 15 min; basta um estourar. O IP vem de `x-real-ip` ou da última
  entrada de `x-forwarded-for` (`getClientIp`) — só confiável atrás de proxy que
  sobrescreve esses cabeçalhos. Em homolog e produção o Redis é exigido:
  `validateEnv()` acusa a falta. O contador do IP não zera no login bem-sucedido.
- **Revisar quando:** o portal precisar de um painel de tentativas bloqueadas
  para o time EDI, ou se o IP real do cliente não chegar pelo proxy da homolog.
