# Fase 5 — Smoke SSO homolog

Checklist para validar o fluxo distribuidor com SSO no ambiente homolog **após Fase 10** (porta única `/`, RBAC por arquivo, Ctrl+K, exports Postman/Insomnia/PDF).

## Pré-condições

- `FUNCIONAL_SSO_GRAPHQL_URL` apontando para homolog.
- `AUTH_SECRET` e `AUTH_URL` configurados.
- `data/permissions.json` com admins EDI (copie de `permissions.example.json`).
- Projeto `im` publicado em `content/projects/im/config.json`.
- Gateway homolog acessível (para playground — opcional no smoke inicial).

## Automatizado (sem SSO real)

```bash
npm run smoke:homolog
curl -s http://localhost:3002/api/health
npm run test:e2e -- tests/e2e/manual-flow.spec.ts
npm run test:e2e -- tests/e2e/playground-allowlist.spec.ts
```

Esperado:

- checks `env`, `content-im`, `module-living-docs` OK;
- fluxo catálogo → roteiro → operação passa com `DEV_AUTH_ENABLED=true`;
- allowlist do playground valida operação permitida e bloqueia fora da lista com `403`.

## Passos manuais

1. Acesse `/` **sem sessão** — formulário de login inline (não use `/login`; redireciona para `/`).
2. Entre com usuário **distribuidor** SSO homolog.
3. Confirme redirect para `/manual` (client) ou `/` (admin).
4. Catálogo exibe **IM — Inventário (homolog)**.
5. Abra `/manual/im` — seções + roteiro + botões **Exportar Postman/Insomnia/PDF**.
6. **Ctrl+K** → busque `createToken` → navegue até a operação.
7. Abra `/manual/im/operations/mutation/createToken` — exemplo GraphQL visível.
8. Playground: execute query allowlisted (`createToken`) no ambiente homolog.
9. Playground: operação **fora** da allowlist → resposta **403**.
10. (Admin) Após execução no playground, `/admin/metrics` incrementa contador.

## Admin (EDI)

1. Login SSO com e-mail listado em `data/permissions.json` → `admins`.
2. `/` mostra hub completo + módulos planejados.
3. `/interno` — guias internos acessíveis.
4. `/admin/projects` — CRUD e editor funcionam.

## Resultado esperado

- Fluxo completo sem erro de autorização indevida.
- Conteúdo IM com paridade funcional vs portal legado (exceto `/admin/clients`).
- Export Postman/Insomnia baixa JSON **sem credenciais**.
- Export PDF baixa arquivo `.pdf` com resumo do manual.

## Referências

- Deploy: [`deploy-homolog.md`](./deploy-homolog.md)
- RBAC: `core/auth/permissions-loader.ts`
- Script: `scripts/smoke-homolog-checklist.ts`
