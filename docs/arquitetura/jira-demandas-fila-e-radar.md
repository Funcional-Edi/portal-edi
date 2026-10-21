# Demandas Jira — Fila, versões e Radar (6 branches)

Padrão do quadro EDI: **`Dev - …`** no título. Branch = chave Jira em minúsculas
(ex.: `edi-14335`).

Ordem sugerida: **B1** → (**B2** ∥ **B4**) → **B3** / **B5** → **B6**.

| # | Chave sugerida | Título Jira (copiar) | Branch |
|---|---|---|---|
| B1 | **EDI-14341** | Dev - Fundação escrita GitHub CMS e papéis admin master e editor EDI | `edi-14341` |
| B2 | **EDI-14342** | Dev - Radar semanal de requisições novas e painel por subproduto | `edi-14342` |
| B3 | *(criar)* | Dev - E-mail configurável do Radar (requisição nova e falha de autenticação) | `edi-xxxxx` |
| B4 | **EDI-14335** | Dev - Evolução Fila de aprovação das alterações da documentação | `edi-14335` |
| B5 | *(criar)* | Dev - Histórico de versões do manual, versão interna e restauração | `edi-xxxxx` |
| B6 | *(criar)* | Dev - Incluir requisição nova do Radar no manual via fila de qualidade | `edi-xxxxx` |
| B7 | *(criar)* | Dev - Tela de gestão de acessos (admin master e editor EDI) | `edi-xxxxx` |

> **Papéis (decisão de 30/09/2026):** só dois papéis internos — **admin master** e
> **editor EDI**. O papel "revisor" foi descartado para simplificar o fluxo. Quem
> não está na lista é **cliente** (só lê a documentação). Todos entram pelo SSO.

Anexos no Jira (repositório `docs/arquitetura/`):

| Demanda | Imagem de fluxo |
|---|---|
| B1 | *(texto no corpo da issue)* |
| B2, B3, B6 | `fluxo-radar-requisicoes-novas.png` |
| B4 | `fluxo-fila-aprovacao-conteudo.png` |
| B5 | `fluxo-dois-tipos-de-versao.png` |

Referências: [ADR-0011](./adr/0011-fila-aprovacao-conteudo.md) ·
[plano-branches-fila-e-radar.md](./plano-branches-fila-e-radar.md)

---

## B1 — Dev - Fundação escrita GitHub CMS e papéis admin master e editor EDI *(EDI-14341)*

Texto pronto para colar no Jira. Atualizado em 30/09/2026: o papel "revisor" saiu do escopo.

### Objetivo

O portal mostra a documentação a partir de arquivos que ficam num repositório do GitHub: texto do manual, seções e configuração do projeto. Hoje ele só consegue **baixar** esses arquivos para exibir na tela.

Quando alguém salva uma alteração na área interna, o portal precisa **devolver** o arquivo alterado para esse mesmo repositório. Essa devolução não existia. Com o GitHub ligado, o salvamento para e a alteração não fica registrada lá. No computador local, sem GitHub, o arquivo continua sendo gravado na pasta do projeto, como já acontecia.

Esta demanda cria essa devolução, com quatro regras para ela não gravar no lugar errado:

1. A alteração vai para uma **branch com nome**. Sem nome, recusa. Nunca vai para a branch principal (`main` ou `master`), que é a versão que o portal publica.
2. Só pode gravar em duas pastas: manuais (`content/`) e dados do Radar (`data/radar/`). Senha de gateway, schema e código do portal são recusados.
3. Vários arquivos da mesma alteração entram **juntos**: ou todos entram, ou nenhum entra.
4. Se outra pessoa alterou a mesma branch no meio do caminho, a gravação **para e avisa**. Não apaga o que a outra pessoa fez.

As telas de hoje ainda não informam o nome da branch. Por isso, o botão salvar da tela continua sem concluir enquanto o GitHub estiver ligado. Quem vai usar essa devolução são a fila de aprovação (EDI-14335) e o Radar (EDI-14342): eles é que vão dizer em qual branch gravar.

A segunda parte da demanda separa quem edita de quem aprova. Hoje só existem administrador e cliente, então a mesma pessoa poderia alterar e publicar. Passam a existir admin master e editor EDI.

Não cria tela nova e não muda o que o cliente (distribuidor) vê.

### Ganhos

- A fila (EDI-14335) e o Radar (EDI-14342) passam a ter uma função pronta para devolver o arquivo alterado ao GitHub, na branch que eles escolherem.
- O conteúdo sensível (senhas de gateway, schema, código do portal) não pode ser gravado por engano.
- Ninguém grava direto na versão principal do repositório, então uma alteração não vai ao ar sem passar por uma branch.
- Se duas pessoas alteram o mesmo conteúdo ao mesmo tempo, a segunda é avisada em vez de apagar o trabalho da primeira em silêncio.
- O time EDI ganha um papel próprio (editor), distinto do admin master que aprova.

### Contexto

A fila de aprovação e o Radar dependem de gravar no GitHub. Hoje essa gravação não existe. O acesso continua sendo pelo SSO de homologação (`https://sso-homologa.funcionalhealth.com.br/graphql/`): o SSO confirma quem é a pessoa, e o portal decide o que ela pode fazer pela lista de papéis.

Referências: ADR-0011 · `docs/arquitetura/estudo-fila-aprovacao-conteudo.md`

### O que esta demanda entrega

**Gravação no GitHub**

- Vários arquivos entram num único envio: ou entram todos, ou nenhum.
- A gravação exige uma branch informada. Sem branch, recusa. Nunca grava em `main` ou `master`.
- Só aceita pastas permitidas: conteúdo dos manuais (`content/**`) e dados do Radar (`data/radar/**`).
- Recusa qualquer outro caminho, em especial senhas e schema (`data/projects/**`), código do portal e arquivos de ambiente. Também recusa caminho com `..` ou caminho absoluto.
- Se a branch mudou desde a leitura, recusa e avisa. Nunca sobrescreve em silêncio.
- A leitura pode escolher uma branch ou uma versão específica.
- A chave de acesso ao GitHub fica só no servidor. A de escrita é separada da de leitura. Nenhuma aparece em log, tela ou resposta.
- Erro de gravação vem com mensagem limpa, sem o retorno bruto do GitHub.
- Testes automáticos cobrem caminho proibido, branch `main` e conflito de versão.
- Os controles novos aparecem no painel `/compliance`.
- No computador de desenvolvimento, sem GitHub configurado, salvar continua gravando na pasta local, como hoje.

**Papéis**

- Três papéis: **admin master**, **editor EDI** e **cliente**.
- A lista fica na variável `PERMISSIONS_CONFIG_JSON` (molde em `data/permissions.example.json`). Ela é a única fonte: login, telas internas e painel de compliance leem a mesma lista.
- Admin pode ser por e-mail exato ou por domínio. Editor EDI **só por e-mail exato**: uma regra de domínio (ex.: `@funcionalcorp.com.br`) é recusada.
- E-mail de pessoa real fica só nessa variável, nunca escrito no código.
- Quem já é admin continua admin. Quem não está na lista vira cliente.
- Toda rota repete a verificação no servidor, não só na tela.

### Regras de cada papel

| Papel | O que pode |
|---|---|
| **Admin master** | Tudo: editar, publicar, conectar gateway, catálogo, criar subproduto e usar o playground |
| **Editor EDI** | Entra na área interna e edita o conteúdo do manual (texto, seções, operações). Vê o checklist de qualidade, mas **não publica** |
| **Cliente** | Só lê a documentação publicada. Não entra na área interna |

Gateway, catálogo e criação de subproduto ficam **só com o admin master até a fila de aprovação (EDI-14335) existir**. Quando a fila existir, o editor EDI passa a fazer essas alterações também, mas elas entram na fila e só valem depois do ok do admin master. Credencial de gateway nunca vai para o GitHub.

### Fora desta demanda

- Tela da fila, botão "Enviar para validação" e a regra "quem envia não aprova" (EDI-14335).
- Tela para o admin incluir outro admin ou editor (demanda B7). Até lá, a lista muda pela variável `PERMISSIONS_CONFIG_JSON`, com novo login da pessoa.
- Radar, e-mail e histórico de versões.

### Como o sistema se comporta

```text
Hoje:  GitHub → portal baixa o arquivo → mostra na tela
        alguém salva → o portal não devolve o arquivo → a alteração se perde

Esta demanda:
  salvar → confere a pasta (só manuais e Radar)
        → confere a branch (nome obrigatório, nunca a principal)
        → devolve todos os arquivos num único envio
        → se alguém alterou no meio, recusa e avisa

As telas atuais ainda não dizem o nome da branch.
A fila e o Radar é que vão chamar essa devolução.

Acesso:
  login pelo SSO → e-mail da pessoa → consulta a lista de papéis
  → admin master | editor EDI | cliente → o servidor libera ou bloqueia
```

**Depende de:** — · **Bloqueia:** EDI-14342 (Radar), EDI-14335 (fila), B7 (tela de acessos)

---

## B2 — Dev - Radar semanal de requisições novas e painel por subproduto *(EDI-14342)*

**Resumo da evolução:** Semanalmente o portal autentica no gateway de cada subproduto GraphQL, compara queries e mutations com a lista já conhecida e registra o que é novo. Painel administrativo por subproduto para o EDI analisar e descartar. Nada muda para o distribuidor.

**Contexto:** Desenvolvimento publica requisição nova sem avisar o EDI; o cliente descobre na API e cobra o EDI. Hoje a leitura do schema ocorre só no cadastro/sincronização manual.

**Critérios de aceitação**

*Verificação*
- Agenda semanal + "Verificar agora" (admin).
- Autentica com URL, login e senha do cadastro (mesma validação do connect).
- Compara queries/mutations atuais com baseline; registra novas (nome, tipo, data).
- Baseline inicial = schema já sincronizado; sem alerta em massa em projetos existentes.
- Não duplica registro na reexecução.
- Não atualiza `schema.json` publicado nem `/docs/api`.
- Falha de auth/gateway: registra data e motivo, sem senha/token.
- Última verificação por subproduto visível.
- REST (ex.: PSP): status "não monitorado".

*Painel*
- Lista por subproduto: nome, tipo, data, descrição do schema.
- Estados: nova, descartada, enviada para aprovação, publicada.
- Filtros; contador no menu admin.
- Descartar exige motivo; item permanece consultável.
- Só EDI/admin; distribuidor não acessa.

**Outras informações**
- Fora do escopo: e-mail (B3), levar ao manual (B6).
- Estado em branch `portal-state`, `data/radar/<slug>.json` (via B1).
- GitHub Actions chama endpoint protegido por segredo (middleware + compliance).
- Módulo `modules/radar/`.
- Separar leitura do gateway de `syncSchema` (não sobrescrever schema publicado).

**Regra, como ficará no sistema**
- Nova = no gateway e fora da baseline.
- Descartada não renotifica.
- Verificação nunca publica schema.
- Credenciais nunca em log, e-mail ou JSON de estado.

**Desenho do fluxo:** anexar `fluxo-radar-requisicoes-novas.png` (seções 1 e 2).

**Depende de:** EDI-14341 · **Bloqueia:** B3, B6

---

## B3 — Dev - E-mail configurável do Radar (requisição nova e falha de autenticação)

**Resumo da evolução:** Após cada verificação do Radar, envia e-mail resumido quando houver requisição nova ou falha de autenticação/conexão. Destinatários configuráveis no portal.

**Contexto:** Painel só funciona se alguém abrir. EDI precisa ser avisado proativamente; falha silenciosa de credencial impede o Radar.

**Critérios de aceitação**
- E-mail com requisições novas: subproduto, lista, link do painel.
- E-mail com falha: subproduto, motivo, data (sem senha/token/resposta bruta).
- Um e-mail por execução (todos os subprodutos).
- Tela admin para destinatários (validação de e-mail); defaults via config, não hardcode no código.
- Valores iniciais sugeridos: `edi@funcionalcorp.com.br`, `edicanais@funcionalcorp.com.br`.
- Falha de envio não interrompe verificação; fica registrada.
- Mesma requisição não gera segundo aviso.

**Outras informações**
- Depende de provedor (M365 ou serviço); chave só server-side em `core/config/env.ts`.
- `core/notifications` + `data/radar/settings.json` em `portal-state`.
- Fora do escopo: Teams/chat.

**Regra, como ficará no sistema**
- Só admin altera destinatários.
- Um aviso por item novo; um resumo de falhas por execução.

**Desenho do fluxo:** anexar `fluxo-radar-requisicoes-novas.png` (seção 2 — aviso).

**Depende de:** B2

---

## B4 — Dev - Evolução Fila de aprovação das alterações da documentação *(EDI-14335)*

**Resumo da evolução:** O editor EDI passa a ter os mesmos poderes de edição do admin (manual, gateway, catálogo, criação de subproduto), mas toda alteração dele entra na fila. O admin master usa `/admin/fila` para aprovar ou devolver. Distribuidor só vê após aprovação, sem depender de deploy de código.

**Contexto:** Autonomia do EDI com controle de qualidade. Hoje alteração na tela reflete imediatamente no conteúdo.

**Critérios de aceitação**

*Escopo do editor EDI*
- Liberar para o editor, **junto com a fila**: conectar/editar gateway, CRUD do catálogo de produtos e criação de subproduto.
- Toda alteração do editor nessas telas vira proposta na fila; nada vale antes da aprovação do admin master.
- Credenciais do gateway **nunca** entram em PR (ficam em `credentials.enc`, fora do Git): a proposta de gateway guarda a alteração pendente cifrada no servidor e só é aplicada na aprovação.
- Sincronizar schema grava em `data/projects/**`, fora da allowlist de B1: definir se entra na fila ou é aplicado na aprovação do subproduto.
- Continuam só do admin master: publicar/despublicar e playground GraphQL.

*Enviar*
- Botão "Enviar para validação" no editor.
- Proposta aberta; cliente permanece na versão atual.
- Reenvio antes da aprovação atualiza a mesma proposta.
- Checklist automático (`manual-quality`, validação de conteúdo) antes da fila humana.
- PR só em `content/**`; fora disso reprovado no CI.
- Conflito de edição: aviso, sem sobrescrita silenciosa.
- Sem credenciais na proposta.
- GitHub CMS: sem gravação direta; local dev mantém comportamento atual.

*Fila*
- `/admin/fila`: autor, data, resumo, checklist, estado.
- Diff em linguagem de negócio.
- Aprovar → publica em segundos (webhook + revalidate cache).
- Devolver → motivo visível ao editor.
- Quem enviou não aprova (validação no servidor).
- **Ponto em aberto:** alteração feita pelo próprio admin master vai direto ou precisa de outro admin master aprovar?
- Proposta > 7 dias sinalizada.
- Auditoria: quem aprovou e quando.

**Outras informações**
- Entregar em commits: enviar → tela → aprovar.
- Fora do escopo: tipos de versão e histórico (B5).
- Módulo `modules/publicacao/`; PR = fila; GitHub App.
- ADR-0011; imagem `fluxo-fila-aprovacao-conteudo.png`.

**Regra, como ficará no sistema**
- Nada chega ao distribuidor sem aprovação.
- Uma proposta aberta por manual.
- Só o admin master aprova; merge em `main`.

**Desenho do fluxo:** anexar `fluxo-fila-aprovacao-conteudo.png`.

**Depende de:** EDI-14341 · **Bloqueia:** B5, B6

---

## B5 — Dev - Histórico de versões do manual, versão interna e restauração

**Resumo da evolução:** Na aprovação, classificar alteração como versão do manual (impacta distribuidor) ou versão interna (só EDI). Tabela Data / Detalhes / Versão no manual público; histórico interno separado. Restaurar versão antiga pela tela, passando pela fila.

**Contexto:** Requisição nova exige que o cliente acompanhe versão; ajuste de texto não. Restauração sem código quando algo aprovado estiver errado.

**Critérios de aceitação**

*Histórico*
- Qualidade escolhe tipo na aprovação; portal sugere pelo diff.
- Versão manual: incrementa `manualVersion` (formato X.Y); linha no histórico do distribuidor.
- Versão interna: número do manual inalterado; registro só área EDI.
- Distribuidor não vê histórico interno.
- Colunas: Data, Detalhes, Versão (sem Autor).
- Linha gerada automaticamente + complemento opcional da qualidade.
- Mix impacto + texto → versão manual.
- Registro guarda referência (commit) para restauração.

*Restauração*
- Ação "Restaurar esta versão" nos históricos.
- Nova proposta na fila; exige aprovação.
- Histórico nunca apagado.
- Restaurar versão manual → nova versão manual; interna → não altera número do distribuidor.
- Despublicar continua imediato e fora da fila.

**Outras informações**
- `history-interno.json` separado de `manual.json`.
- Schema Zod: `versionHistory` sem autor obrigatório; campo commit.
- Imagem `fluxo-dois-tipos-de-versao.png`.

**Regra, como ficará no sistema**
- Versão do distribuidor só sobe na aprovação tipo manual.
- Restauração = nova proposta, nunca rewrite de histórico.

**Desenho do fluxo:** anexar `fluxo-dois-tipos-de-versao.png` + texto restauração (plano B5).

**Depende de:** B4 · **Bloqueia:** B6 (parcial)

---

## B6 — Dev - Incluir requisição nova do Radar no manual via fila de qualidade

**Resumo da evolução:** No painel Radar, EDI usa "Levar para o subproduto" com rascunho sugerido pelo schema e flag "Gera versão nova para o distribuidor". Entra na mesma fila da qualidade; só após aprovação aparece no manual e na referência filtrada da API.

**Contexto:** Requisição detectada não pode ir automaticamente ao cliente; EDI decide relevância e qualidade valida.

**Critérios de aceitação**
- Ação no item estado "nova".
- Formulário pré-preenchido (título, descrição, exemplo); EDI completa.
- Flag versão distribuidor (default ligada).
- Confirma → fila + estado "enviada para aprovação".
- Aprovado → operação no manual, histórico automático, estado "publicada".
- Devolvido → estado "nova" + motivo.
- Distribuidor só vê após aprovação, inclusive `/docs/api` (filtrar pelo manual).

**Outras informações**
- Reusa `getSuggestedOperations`, `addManualOperationsBulk`.
- Pré-requisito decisão: `/docs/api` listar só operações documentadas no manual.

**Regra, como ficará no sistema**
- Radar nunca publica operação sozinho.
- Flag orienta tipo de versão na aprovação (B5).

**Desenho do fluxo:** anexar `fluxo-radar-requisicoes-novas.png` (seções 2 e 3).

**Depende de:** B2, B4, B5

---

## B7 — Dev - Tela de gestão de acessos (admin master e editor EDI)

**Resumo da evolução:** Tela no portal onde só o admin master inclui ou remove outro admin master ou editor EDI. Acaba a necessidade de mexer em variável de servidor e fazer deploy para dar acesso.

**Contexto:** Hoje a lista de acessos fica em `PERMISSIONS_CONFIG_JSON`; mudar exige alterar a variável e reiniciar/deployar. Regra do projeto: nada de configuração presa no código.

**Critérios de aceitação**
- Tela `/admin/acessos` visível e utilizável só pelo admin master.
- Incluir e remover e-mail como admin master ou editor EDI; e-mail exato, nunca domínio.
- Lista gravada no repositório de conteúdo do GitHub via escrita segura de B1 (histórico de quem mudou e quando).
- Primeiro admin master vem de variável do servidor (bootstrap); sem isso ninguém entraria para cadastrar.
- O último admin master não pode ser removido.
- Mudança vale no próximo login da pessoa.
- Registrar controle em `/compliance`.

**Outras informações**
- Liberar na allowlist de B1 só o caminho do arquivo de acessos (ex.: `data/access/permissions.json`).
- A leitura acontece no login (servidor Node) e o papel vai para a sessão; o middleware continua sem ler arquivo.
- Tirar o admin padrão escrito em `core/auth/roles.ts` quando o bootstrap por variável existir.

**Regra, como ficará no sistema**
- Só admin master gerencia acessos.
- Quem não está na lista é cliente.

**Depende de:** EDI-14341
