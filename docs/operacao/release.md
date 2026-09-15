# Fluxo operacional de release

Este guia descreve o caminho que deve seguir depois dos testes
internos, antes de publicar uma mudanca via GitHub. Ele vale para correcoes de
teste automatizado, conteudo, frontend e servicos do portal.

## Principios

- Trabalhe sempre em uma branch de tarefa, nunca direto na `main`.
- Rode as validacoes antes de fazer commit.
- Use `git add` com arquivos explicitos, evitando levar alteracoes fora do
  escopo.
- So abra PR quando a branch estiver limpa, com commit claro e validacoes
  registradas.
- Se uma validacao falhar, corrija, rode novamente e so entao faca commit/push.

## Validacoes locais

Rode primeiro o gate principal do projeto:

```bash
npm run ci
```

Esse comando executa, nesta ordem:

| Etapa | Script | O que valida |
| --- | --- | --- |
| Tipos | `npm run typecheck` | Contratos TypeScript |
| Lint | `npm run lint` | Padrao de codigo |
| Arquitetura | `npm run arch` | Regra `app -> modules -> core`, modulos isolados e sem ciclos |
| Testes | `npm run test` | Testes automatizados com Vitest |
| Build | `npm run build` | Build de producao do Next.js |

Para mudancas em manuais, schemas, catalogo, conteudo publicado ou fixtures de
produto, rode tambem:

```bash
npm run content:validate-published
```

Para mudancas que afetam navegacao, telas, autenticacao, playground ou fluxo
completo do usuario, rode:

```bash
npm run test:e2e
```

Observacao: o E2E usa Playwright com Microsoft Edge. Se o ambiente local nao
tiver o navegador instalado, instale com `npx playwright install msedge` ou
registre no PR que o E2E local nao foi executado por limitacao de ambiente.

Para deploy/homologacao, apos a aplicacao estar rodando no ambiente correto,
rode:

```bash
npm run smoke:homolog
```

## Fluxo Git

Antes do stage:

```bash
git status -sb
git diff --check
```

Confira o diff:

```bash
git diff
```

Adicione apenas os arquivos da mudanca:

```bash
git add caminho/do/arquivo.ts caminho/do/teste.test.ts
```

Crie um commit com mensagem objetiva:

```bash
git commit -m "test: ajusta cenarios de schema do wholesaler"
```

Use prefixos consistentes:

| Prefixo | Quando usar |
| --- | --- |
| `fix:` | Correcao de bug de produto |
| `test:` | Ajuste/adicao de testes |
| `feat:` | Nova funcionalidade |
| `docs:` | Documentacao |
| `refactor:` | Reorganizacao sem mudar comportamento |
| `chore:` | Manutencao, tooling ou tarefa operacional |

Publique a branch:

```bash
git push -u origin nome-da-branch
```

Se a branch ja tiver upstream:

```bash
git push
```

## Pull request e release no GitHub

1. Abra PR da branch para `main`.
2. No corpo do PR, liste:
   - objetivo da mudanca;
   - arquivos/areas impactadas;
   - validacoes executadas;
   - validacoes nao executadas e motivo, se houver.
3. Aguarde o workflow **CI** do GitHub ficar verde.
4. Peca revisao quando a mudanca nao for trivial.
5. Depois do merge, acompanhe o workflow em `main`.
6. Se o time estiver usando GitHub Releases/tags, crie a release apontando para
   o commit mergeado em `main` e use as notas do PR como base.

Atualmente nao ha script `release` no `package.json` nem workflow dedicado de
publicacao. Portanto, o criterio minimo de release e: PR aprovado, CI verde e
merge na `main`. Qualquer tag/release formal deve ser criada no GitHub conforme
o procedimento do time.

## Modelo de descricao do PR

```md
## Objetivo

Corrige os testes automatizados do schema publicado do Wholesaler.

## Mudancas

- Atualiza o Wholesaler para ser tratado como produto com snapshot publicado.
- Mantem cobertura para produto publicado sem snapshot via fixture dedicada.
- Ajusta indice de busca para validar a indexacao do Wholesaler.

## Validacoes

- [x] npm run ci
- [x] npm run content:validate-published
- [ ] npm run test:e2e - nao executado: ambiente local sem Microsoft Edge/fora do escopo

## Risco

Baixo. Mudanca restrita a testes automatizados e fixtures temporarias de teste.
```

## Checklist rapido

- [ ] Branch atualizada e fora da `main`.
- [ ] `npm run ci` passou.
- [ ] `npm run content:validate-published` passou quando envolver conteudo/schema.
- [ ] `npm run test:e2e` executado ou justificativa registrada.
- [ ] `git diff --check` sem erros.
- [ ] `git add` feito somente com arquivos da mudanca.
- [ ] Commit com mensagem objetiva.
- [ ] Push realizado.
- [ ] PR aberto para `main`.
- [ ] CI do GitHub verde antes de merge/release.