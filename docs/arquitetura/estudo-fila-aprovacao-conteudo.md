# Estudo — Fila de aprovação e publicação versionada de conteúdo

- **Status:** estudo concluído — decisões registradas em
  [ADR-0011](./adr/0011-fila-aprovacao-conteudo.md)
- **Data:** 2026-09-28
- **Escopo:** alterações editoriais feitas na tela (manuais, seções, nomes,
  metadados) que só chegam ao cliente depois do aval do time de qualidade.

## 1. Problema

O time de EDI precisa alterar documentação **sem abrir código e sem depender do
time de desenvolvimento**. Mas autonomia sem controle vira risco: um nome errado
em um manual de integração é um distribuidor integrando errado.

O fluxo desejado:

```text
EDI edita na tela → nada muda para o cliente
        ↓
entra em uma fila de alterações
        ↓
qualidade revisa e aprova
        ↓
vira uma nova versão no GitHub
        ↓
o cliente passa a ver a versão aprovada
```

Três exigências implícitas, que o desenho precisa atender juntas:

1. **Autonomia** — quem edita não escreve código nem usa Git.
2. **Controle** — nada publica sem segunda pessoa aprovando.
3. **Rastro** — toda alteração tem autor, data, diff e versão recuperáveis.

## 2. O que o portal já tem (não reinventar)

Metade da fundação já existe. Levantamento do código atual:

| Peça | Onde | Estado |
|---|---|---|
| Edição pela tela | `modules/living-docs-externa/ui/admin/manual-editor.tsx` | Pronto |
| Escrita de conteúdo | `core/db/adapters/local-content-store.ts` | Pronto (só local) |
| Leitura do GitHub | `core/db/adapters/github-content-store.ts` (Octokit) | Pronto (só leitura) |
| Porta única de I/O | `core/db/adapters/index.ts` | Pronto; escrita GitHub lança erro |
| Checklist automático | `services/manual-quality.ts` + `GET .../quality` | Pronto |
| Gate de publicação | `services/publish-project.ts` (bloqueia `published: true` com check `fail`) | Pronto |
| Validação em CI | `npm run content:validate-published` | Pronto |
| Campos de versão | `manual.json`: `manualVersion`, `versionHistory[]` | Existem, ninguém preenche |
| Papéis | `core/auth/roles.ts`: só `admin` e `client` | Insuficiente |
| Fila / aprovação | — | **Não existe** |
| Escrita no GitHub | — | **Não existe** |

O que falta é o **meio do caminho**: pegar a edição que hoje grava direto no
disco e transformá-la em uma proposta de alteração revisável.

## 3. Como o mercado resolve isso

Pesquisa em CMS git-backed e CMS corporativos:

| Produto | Modelo | O que dá para copiar |
|---|---|---|
| Decap CMS | `publish_mode: editorial_workflow` — salvar cria branch `cms/<colecao>/<slug>` e abre PR; aprovar = merge | O mapeamento ação-de-tela → ação-de-Git, já provado |
| Sveltia CMS | Igual Decap, mas o **status é um label no PR** (`rascunho`/`em revisão`/`pronto`) | Estado da fila sem banco: o label é a fonte da verdade |
| TinaCMS | Branch + PR *draft*, com preview por branch | Preview da versão em revisão antes de aprovar |
| GitCMS | Quadro editorial "Ideia → Rascunho → Revisão → Publicado"; o revisor nunca vê branch nem PR | A linguagem da interface: tarefa e etapa, não Git |
| Contentful / Sanity | Estados de conteúdo em banco proprietário, releases agendados | Nada — exige banco e nos prende a um fornecedor |
| Gitana | Versionamento tipo Git com workflow de aprovação embutido | Diff visual lado a lado para não-técnico |

**Conclusão do mercado:** o padrão consolidado é *branch + Pull Request por
item de conteúdo, com o merge como ato de publicação*. Ninguém sério mantém uma
fila de aprovação em banco próprio **e** um repositório Git — isso cria duas
verdades que divergem no primeiro erro de rede.

O que o mercado ainda faz mal, e é onde podemos ser melhores: o revisor quase
sempre acaba vendo um diff de JSON. Nenhum deles entende o *domínio* do
conteúdo a ponto de dizer "esta alteração renomeia uma operação que 3
distribuidores já usam".

## 4. A decisão central: onde vive a fila?

Esta é a única escolha que realmente importa; o resto decorre dela.

### Opção A — fila no portal, com banco próprio

Tabela de `pending_changes`, aprovação grava status, um job depois empurra para
o GitHub.

- Exige a capacidade `"queue"` em `core/db`, hoje indisponível (ADR-0002) —
  `requireDatabase()` iria falhar de propósito. Introduzir banco só para isso é
  desproporcional.
- Cria duas fontes de verdade: a fila e o repositório. Se o push falhar depois
  do "aprovado", o portal mente para o usuário.
- Reconstrói do zero: diff, comentários, histórico, controle de acesso, auditoria.

**Descartada.**

### Opção B — o Pull Request *é* a fila; o portal é a interface

A tela de fila é uma projeção de `GET /repos/.../pulls?labels=conteudo`. Não há
estado a persistir: o estado da alteração é o estado do PR.

- Zero banco. A capacidade `"content"` já disponível basta.
- Diff, histórico, autoria, comentários, auditoria e rollback vêm de graça.
- Ninguém do time de qualidade precisa abrir o GitHub — mas tudo que acontece
  no portal está lá, auditável, para quem precisar.
- Se o portal cair, o conteúdo aprovado continua íntegro e publicável.

**Recomendada.**

### Opção C — híbrido com cache de leitura

Opção B, mais um cache curto (30–60s) da listagem de PRs para não estourar rate
limit da API do GitHub. Não é uma terceira arquitetura, é um detalhe de
implementação da B — e é o que de fato vamos fazer.

> Isto confirma e detalha a direção já registrada em
> `docs/migracao/github-cms-staging.md` ("a aprovação oficial deve permanecer no
> Pull Request"), agora com o ponto que faltava: **a interface da aprovação fica
> no portal**, o mecanismo fica no Git.

## 5. Fluxo recomendado, ponta a ponta

```text
[1] EDI edita o manual na tela
        rascunho no navegador (nada sai do browser)
        ↓ botão "Enviar para validação"
[2] Servidor: sessão SSO + papel editor + Zod + allowlist de caminhos
        ↓
[3] Commit atômico (manual.json + sections/*.md) em branch content/<slug>/<n>
        ↓
[4] PR aberto/atualizado contra `main`, com label conteudo:em-revisao
        ↓
[5] CI roda: typecheck, schema Zod, checklist de qualidade, "só mexeu em content/?"
        ↓
[6] Alteração aparece na fila do portal (/admin/fila) com diff em linguagem de negócio
        ↓
[7] Qualidade aprova na tela  → review + merge via GitHub App (4 olhos obrigatório)
    ou devolve com motivo    → label conteudo:ajustes, volta para o editor
        ↓
[8] Merge: bump de versão + entrada no versionHistory + webhook revalida o cache
        ↓
[9] Cliente vê a nova versão do manual
```

### Detalhes que decidem se isso funciona ou não

**[3] Commit atômico.** Usar a **Git Data API** (blob → tree → commit → ref), não
a Contents API. A Contents API grava um arquivo por requisição: uma alteração
que toca `manual.json` e duas seções viraria três commits, e uma falha no meio
deixaria a branch inconsistente. Git Data API faz tudo em um commit ou nenhum.

**[3] Uma branch por manual, não por edição.** `content/<slug>/<issue|data>`.
Editar de novo antes da aprovação adiciona commit ao PR existente — exatamente
como Decap/Sveltia fazem. Sem isso, três correções de digitação viram três PRs
concorrentes no mesmo arquivo.

**[3] Conflito.** O commit parte do SHA que o editor carregou. Se a `main` andou
desde então, o servidor recria a branch a partir da `main` atual e reaplica —
ou, se o mesmo campo mudou, devolve "este manual foi alterado por Fulano;
recarregue". Nunca sobrescrever silenciosamente.

**[4] Identidade.** O commit é feito pela GitHub App, mas carrega o humano:
`Co-authored-by:` e trailer `Portal-Author: fulano@funcionalcorp.com.br`. O
autor real nunca se perde, mesmo sem conta no GitHub.

**[5] Gate automático antes do humano.** `evaluateManualQuality()` já existe e já
distingue `fail` de `warn`. Rodá-lo no CI e publicar o resultado como check do PR
significa que **a qualidade só gasta atenção no que passou no básico**. Isso é o
maior ganho de eficiência do desenho inteiro.

**[5] Cerca de caminhos.** Um check do CI reprova qualquer PR do bot que toque
fora de `content/**`. Mesmo que o token vaze ou o código tenha bug, o raio de
dano não alcança `.github/`, `core/`, `.env` ou infraestrutura.

**[7] Quatro olhos.** Comparar o `Portal-Author` do PR com o e-mail de quem
clica em aprovar. Igual → recusa. Regra de negócio no servidor, não só na UI.

**[9] Quando o cliente vê.** Ponto que precisa de decisão explícita:

| Estratégia | Latência | Custo |
|---|---|---|
| Webhook do GitHub → `POST /api/content/revalidate` (HMAC) | segundos | precisa expor 1 rota e validar assinatura |
| Esperar o próximo deploy | horas/dias | zero, mas conteúdo aprovado fica invisível |

Recomendação: **webhook**. Como o backend de conteúdo lê do GitHub em runtime,
amarrar publicação de texto a deploy de código é um acoplamento que não precisa
existir — e transforma "corrigir um nome errado" em "pedir um deploy".

## 6. Versionamento

Os campos já existem em `manual.json` e estão vazios. Semântica proposta:

- `manualVersion`: semântico (`2.3.1`), **bump no merge**, nunca na edição.
- `versionHistory[]`: uma entrada por aprovação — data, autor, versão, resumo.
  Gerada pelo servidor a partir do diff, não digitada.

Sugestão automática do tipo de bump, confirmável pelo editor:

| Diff detectado | Bump | Por quê |
|---|---|---|
| Operação removida ou renomeada; campo obrigatório novo | **major** | quebra integração existente |
| Operação nova, seção nova | **minor** | adiciona sem quebrar |
| Texto, descrição, exemplo, correção | **patch** | não muda contrato |

Isso é possível porque o conteúdo é **estruturado e validado por Zod** — dá para
comparar operação a operação, não linha a linha. Um CMS genérico não consegue.

**Rollback:** `git revert` do merge commit, aberto como PR automático pelo botão
"Reverter para a versão anterior". Sem banco, sem snapshot paralelo.

**Emergência:** despublicar (`published: false`) continua fora da fila.
`setProjectPublished` já nunca bloqueia despublicação — tirar do ar precisa ser
sempre imediato.

## 7. Papéis

Hoje `UserRole` é só `admin | client`. O fluxo exige três capacidades distintas,
alinhadas aos grupos já previstos em `github-cms-staging.md`:

| Papel | Pode | Não pode |
|---|---|---|
| `editor` (EDI) | editar, enviar para validação | aprovar, publicar |
| `reviewer` (qualidade) | aprovar, devolver, comentar | aprovar o que enviou |
| `admin` | tudo, incluindo despublicar em emergência | — |

Configurável por `data/permissions.json` (mesmo mecanismo de hoje), migrando
para grupos do SSO quando existirem. Nunca liberar por domínio de e-mail: todo
`@funcionalcorp.com.br` viraria aprovador.

## 8. Onde o código mora

A regra `app → modules → core`, com módulos isolados, força uma separação boa:

- `core/db/adapters/github-content-store.ts` — ganha escrita: `writeGithubFiles`
  (Git Data API), `ensureBranch`, `openOrUpdatePullRequest`, `mergePullRequest`.
  Infraestrutura pura, sem regra editorial.
- **`modules/publicacao/`** (novo) — a fila, os estados, as regras de aprovação,
  o cálculo de versão. Módulo próprio, não dentro de `living-docs-externa`,
  porque `manuais-internos` vai precisar da mesma fila e **um módulo não pode
  importar o outro** (`npm run arch` quebraria).
- `app/admin/fila/` — a tela.

Contrato genérico entre eles: uma alteração é `{ paths[], autor, resumo,
origem }`. O módulo de publicação não precisa entender manual de EDI; a
humanização do diff por tipo de arquivo entra depois, como camada opcional.

**Correção necessária no adapter atual:** `getGithubContent()` não passa `ref` —
lê sempre a branch default. Para o editor ver a própria versão pendente
enquanto o cliente vê a aprovada, a leitura precisa aceitar `ref`.

## 9. Riscos

| Risco | Mitigação |
|---|---|
| Token de escrita vazado | GitHub App (não PAT pessoal), permissão mínima Contents+PR, só no servidor, escopo `content/**` validado no CI |
| Aprovação por fora, direto no GitHub | Branch protection em `main`: sem push direto, review obrigatório, CODEOWNERS |
| Editor aprovando a si mesmo | Comparação de identidade no servidor + branch protection |
| Rate limit da API do GitHub | Cache de 30–60s na listagem da fila; webhook em vez de polling |
| PR abandonado na fila | Alerta por idade (> 7 dias) na tela e notificação para `edi@funcionalcorp.com.br` |
| Portal fora do ar com fila cheia | Nada se perde: os PRs continuam no GitHub e podem ser aprovados lá |
| Conteúdo sensível no commit | Allowlist de caminhos + secret scanning + push protection; nunca `data/credentials.enc` |

Cada controle desses precisa ser registrado em
`modules/compliance/data/controls.ts` conforme a regra de segurança do projeto.

## 10. Implementação incremental

Cada fase entrega valor sozinha e é reversível.

| Fase | Entrega | Como saber que funcionou |
|---|---|---|
| 1 | Escrita no GitHub: branch + commit atômico + PR, botão "Enviar para validação" | Editar na tela abre um PR com o diff certo e nada muda para o cliente |
| 2 | Tela de fila (leitura sobre a API do GitHub) + checklist de qualidade como check do CI | Qualidade vê o que está pendente sem abrir o GitHub |
| 3 | Aprovar / devolver pela tela, com merge via App, 4 olhos e papéis `editor`/`reviewer` | Aprovação publica; autor não consegue aprovar o próprio envio |
| 4 | Versão semântica automática + `versionHistory` + webhook de revalidação | Cliente vê a versão nova em segundos, com changelog |
| 5 | Diff em linguagem de negócio, reverter em 1 clique, controles de compliance | Revisor entende a mudança sem ler JSON |

**Menor primeiro passo útil:** fase 1 restrita a um projeto piloto
(`content/projects/demo/`), com o backend GitHub ligado só em homologação. Isso
valida a parte mais arriscada — escrita concorrente e conflito de SHA — sem
expor nenhum manual real.

## 11. Decidido e ainda em aberto

Decidido (ADR-0011): merge direto em `main`; conteúdo no mesmo repositório;
GitHub App própria; restauração de versão anterior pela tela, passando pela
mesma fila.

Ainda em aberto:

1. Publicação agendada (aprovar hoje, publicar segunda) entra no escopo?
2. A qualidade aprova o manual inteiro ou alteração por alteração?
3. A fila mostra preview do manual renderizado antes da aprovação, ou só o diff?

## Referências

- `docs/migracao/github-cms-staging.md` — segurança, branches, autosave (modos B e C)
- `docs/arquitetura/adr/0002-camada-dados-adapter.md` — por que não há banco
- `docs/arquitetura/adr/0009-content-cms-adapter.md` — adapters de conteúdo
- [Decap CMS — Editorial Workflows](https://decapcms.org/docs/editorial-workflows/)
- [Sveltia CMS — Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial)
- [TinaCMS — Editorial Workflow](https://tina.io/docs/tinacloud/editorial-workflow)
