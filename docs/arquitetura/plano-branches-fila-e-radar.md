# Plano de branches — Fila de aprovação, Versões e Radar de requisições

- **Data:** 2026-09-29
- **Base:** [ADR-0011](./adr/0011-fila-aprovacao-conteudo.md) e
  [estudo da fila](./estudo-fila-aprovacao-conteudo.md)
- **Como usar:** cada bloco `B1`…`B6` vira uma demanda no Jira. Títulos no
  padrão **`Dev - …`** e textos prontos para colar:
  [`jira-demandas-fila-e-radar.md`](./jira-demandas-fila-e-radar.md). A branch
  segue a chave Jira em minúsculas. Chaves definidas: **B1 = EDI-14341**,
  **B2 = EDI-14342**, **B4 = EDI-14335** (ver tabela abaixo).
- **Desenhos:** usam as imagens abaixo. A `B1` tem um fluxo curto em texto.
  - Fila de aprovação: `fluxo-fila-aprovacao-conteudo.png`
  - Dois tipos de versão: `fluxo-dois-tipos-de-versao.png`
  - Radar: `fluxo-radar-requisicoes-novas.png`

## Chaves Jira e branches

| # | Chave Jira | Título no Jira | Branch Git |
|---|---|---|---|
| B1 | EDI-14341 | Dev - Fundação escrita GitHub CMS e papéis admin master e editor EDI | `edi-14341` |
| B2 | EDI-14342 | Dev - Radar semanal de requisições novas e painel por subproduto | `edi-14342` |
| B3 | *(criar)* | Dev - E-mail configurável do Radar (requisição nova e falha de autenticação) | `edi-xxxxx` |
| B4 | EDI-14335 | Dev - Evolução Fila de aprovação das alterações da documentação | `edi-14335` |
| B5 | *(criar)* | Dev - Histórico de versões do manual, versão interna e restauração | `edi-xxxxx` |
| B6 | *(criar)* | Dev - Incluir requisição nova do Radar no manual via fila de qualidade | `edi-xxxxx` |

## Ordem e dependências

| # | Título | Depende de | Entrega valor sozinha? |
|---|---|---|---|
| B1 (14341) | Fundação: gravar conteúdo no GitHub com segurança e papéis do time | — | Não (base) |
| B2 (14342) | Radar: verificação semanal do gateway e painel de novas requisições | B1 | Sim: o EDI passa a enxergar e descartar |
| B3 | Radar: aviso por e-mail de requisição nova e de falha de autenticação | B2 | Sim: resolve a dor de saber pelo cliente |
| B4 (14335) | Fila de aprovação: enviar, aprovar e devolver alteração do manual | B1 | Sim: nada mais publica sem passar pela fila |
| B5 | Histórico de versões em dois tipos e restauração de versão anterior | B4 | Sim |
| B6 | Levar requisição nova ao subproduto pela fila | B2, B4, B5 | Sim: junta Radar e fila |

```text
B1 Fundação
   ├─ B2 Radar (detecção + painel) ─ B3 E-mail ─────┐
   └─ B4 Fila (enviar + aprovar) ─ B5 Versões ──────┴─ B6 Levar ao subproduto
```

Depois de B1, o Radar (B2, B3) e a Fila (B4, B5) andam em paralelo, sem se tocar.
O Radar vem primeiro porque a dor de hoje é descobrir requisição nova pelo
cliente, e ele só precisa de B1.

**B4 é a maior.** Para o review não virar um bloco só, ela é entregue em
commits por etapa, nesta ordem: enviar, tela da fila, aprovar.

## Decisões que ainda dependem de resposta

1. **Onde o portal roda e onde ficam as credenciais do gateway.** A senha
   cifrada fica em `data/projects/<slug>/credentials.enc`, em disco, fora do Git.
   A verificação semanal precisa dela. Se o ambiente não tiver disco que
   persista, ou não for alcançável pela internet, B2 muda (ver B2).
2. **Provedor de e-mail** (B3): Microsoft 365 ou serviço de envio. Precisa da
   infraestrutura para liberar a conta ou a chave.
3. **`/docs/api` deve listar só o que está no manual?** Hoje lista o schema
   inteiro. Se continuar assim, o cliente enxerga a requisição nova assim que
   alguém clicar em "Sincronizar schema", mesmo sem aprovação (ver B6).
4. **Detectar também requisição removida?** Não foi pedido. Custa pouco em B2
   e é a mudança que mais quebra cliente.
5. **Coluna do histórico:** na imagem a última coluna aparece como "Layout" e
   traz "Versão 1.0". No plano ela se chama "Versão". Confirmar o nome (B5).

---

## B1 — Fundação: gravar conteúdo no GitHub com segurança e papéis do time

**Título da demanda:** Fundação: gravar conteúdo no GitHub com segurança e papéis do time

**Resumo da evolução:** O portal hoje só lê o GitHub e só conhece administrador
e cliente. Esta demanda permite gravar com segurança e separa quem edita de quem
aprova. Sem tela nova e sem mudar o que o usuário vê hoje.

**Contexto:** A fila de aprovação e o Radar precisam gravar no GitHub. Hoje toda
gravação com o GitHub ligado falha com "Escrita no GitHub CMS ainda não
implementada". Além disso, sem papéis distintos, a mesma pessoa poderia enviar e
aprovar a própria alteração.

**Critérios de aceitação**

Gravação:
- Grava vários arquivos em um único envio, e ou entram todos ou nenhum.
- Grava numa branch informada. Nunca grava direto em `main`.
- Só aceita caminhos permitidos (`content/**` e `data/radar/**`). Qualquer outro é recusado.
- Recusa caminho com `..` ou caminho absoluto.
- Se o arquivo mudou desde que foi lido, recusa e avisa. Nunca sobrescreve em silêncio.
- A leitura aceita escolher a branch ou a versão que quer ler.
- O token fica só no servidor e nunca aparece em log, tela ou resposta.
- Erro devolve mensagem simples, sem o texto bruto do GitHub.
- Testes automáticos cobrem caminho proibido e conflito.
- O controle entra no catálogo de `/compliance`.

Papéis:
- Três papéis, atribuídos por e-mail exato em `data/permissions.json`: editor (EDI), revisor (qualidade) e administrador.
- Nunca se atribui papel por domínio de e-mail.
- Editor edita e envia. Revisor aprova e devolve. Administrador faz tudo.
- Administradores atuais continuam administradores.
- Cliente (distribuidor) continua sem acesso a telas internas.
- As rotas repetem a verificação de papel no servidor.

**Outras informações**
- Fora desta demanda: telas, fila, e-mail, e a regra "quem envia não aprova" (fica em B4).
- Pendente decidir: GitHub App (recomendado) ou token com permissão mínima no início.
- Token de leitura e de escrita são separados.
- Validar primeiro no projeto `demo`, em homologação.
- Onde mexe: `core/db/adapters/github-content-store.ts`, `core/db/adapters/index.ts` e `core/auth/roles.ts`. Hoje `UserRole` é `admin | client`. O commit de vários arquivos usa a API de baixo nível do GitHub (Git Data API), não a de arquivo por arquivo.
- Endereços reais de pessoas ficam em `permissions.json`, nunca em valores padrão no código.
- Mudanças independentes: um problema na gravação não deve segurar os papéis, e o contrário também.

**Regra**
- A escrita só vale para a lista de caminhos permitidos.
- Conflito sempre para e avisa.
- Sem papel atribuído, a pessoa é cliente. O papel vem da lista, não do domínio do e-mail.

**Desenho do fluxo**
```text
Gravação: serviço pede gravação → confere caminho → confere versão do arquivo
   → monta commit único → grava na branch → devolve resultado
   (caminho proibido ou arquivo mudou → recusa com aviso)

Papéis: login SSO → e-mail → procura na lista de permissões
   → editor | revisor | admin | cliente → libera ou bloqueia a tela
```

---

## B2 — Radar: verificação semanal do gateway e painel de novas requisições

**Título da demanda:** Radar: verificação semanal do gateway e painel de novas requisições

**Resumo da evolução:** Uma vez por semana o portal autentica no gateway de cada
subproduto, lê as queries e mutations e registra o que é novo. Uma tela mostra
por subproduto o que apareceu, e o EDI descarta o que não se aplica. Nada muda
para o distribuidor.

**Contexto:** Às vezes o time de desenvolvimento cria uma requisição nova e não
avisa o EDI. O cliente vê direto na API e pergunta ao EDI, que só fica sabendo
por ele. Hoje as requisições são lidas uma vez, no cadastro do subproduto.

**Critérios de aceitação**

Verificação:
- Uma vez por semana, o portal autentica no gateway de cada subproduto com a URL, o login e a senha do cadastro. É a mesma validação do cadastro.
- Lê as queries e mutations e compara com a lista que o EDI já conhecia.
- O que não estava na lista é registrado como "nova", com nome, tipo e data.
- A lista conhecida inicial é o que o portal já tinha sincronizado. Subproduto já cadastrado não gera aviso em massa.
- Repetir a verificação não duplica registros.
- A verificação não muda o que o distribuidor vê, incluindo a referência da API.
- Erro de autenticação, URL inválida ou gateway fora do ar é registrado com data e motivo, sem senha nem token.
- Cada subproduto guarda a data e o resultado da última verificação.
- O administrador pode pedir "Verificar agora".
- Subprodutos REST (ex.: PSP) aparecem como "não monitorado", pois não têm introspecção.

Painel:
- Tela administrativa lista, por subproduto: nome, tipo (query ou mutation), data em que apareceu e descrição do schema.
- Cada item tem um estado: nova, descartada, enviada para aprovação ou publicada.
- Filtro por subproduto e por estado.
- Mostra a data e o resultado da última verificação, incluindo o erro quando falhou.
- Aparece a quantidade de requisições novas pendentes no menu administrativo.
- Descartar exige um motivo. O item descartado sai da lista principal e continua consultável.
- Só o time de EDI acessa. Distribuidor nunca vê essa tela.

**Outras informações**
- Fora desta demanda: e-mail (B3) e levar a requisição ao manual (B6).
- Reaproveita o `syncSchema` (autenticação e leitura do schema). É preciso separar "ler o gateway" de "gravar o schema publicado". Hoje o sync grava `schema.json`, e é esse arquivo que alimenta `/docs/api`.
- O estado fica numa branch própria (`portal-state`), em `data/radar/<slug>.json`. Não passa pela fila da qualidade, pois é registro de operação, não conteúdo. Não gera ruído em `main`.
- Agenda: workflow do GitHub Actions semanal, mais disparo manual. Ele só chama o portal. A leitura e a senha ficam no portal.
- Limites do agendador do GitHub: pode atrasar alguns minutos e é pausado após 60 dias sem atividade no repositório.
- Se o portal não for alcançável pela internet, o agendador precisa rodar dentro do ambiente (decisão 1).
- Endpoint novo, protegido por segredo do servidor (exceção ao login de usuário). Entra no `middleware.ts` e no catálogo de compliance, com comparação segura do segredo e limite de chamadas.
- Novo módulo `modules/radar/`, pois módulos não importam uns aos outros. Toda rota da tela exige login e permissão.
- Sugestão: detectar também requisição removida (decisão 4).

**Regra**
- Nova = existe no gateway e não está na lista conhecida.
- Descartada não volta a ser avisada.
- A verificação nunca grava o schema publicado.
- Senha e token nunca vão para log, e-mail, tela ou estado.
- Descartar é decisão do EDI e fica registrada com data e motivo.
- Só a requisição no estado "nova" pode ser descartada ou enviada.

**Desenho do fluxo** → `fluxo-radar-requisicoes-novas.png` (blocos 1 e 2)

---

## B3 — Radar: aviso por e-mail de requisição nova e de falha de autenticação

**Título da demanda:** Radar: aviso por e-mail de requisição nova e de falha de autenticação

**Resumo da evolução:** Ao fim de cada verificação, o portal avisa o EDI por
e-mail quando achar requisição nova ou quando não conseguir autenticar.

**Contexto:** O painel só ajuda quem abre a tela. O EDI precisa ser avisado sem
depender de lembrar de olhar. Falha de autenticação também precisa chegar ao
EDI, com o erro, senão o Radar para sem ninguém perceber.

**Critérios de aceitação**
- Achou requisição nova: e-mail com o subproduto, a lista e o link do painel.
- Falha de autenticação ou gateway fora: e-mail com o subproduto, o motivo e a data.
- Um e-mail por execução, reunindo todos os subprodutos, para não inundar a caixa.
- Os destinatários são configuráveis numa tela do portal, só para o administrador. Cada endereço é validado.
- O ponto de partida são `edi@funcionalcorp.com.br` e `edicanais@funcionalcorp.com.br`. Os endereços ficam na configuração, não no código.
- Falha no envio não derruba a verificação e fica registrada.
- O e-mail nunca leva senha, token nem resposta bruta do gateway.
- A mesma requisição não é avisada duas vezes.

**Outras informações**
- Fora desta demanda: outros canais (Teams, chat).
- Pendente: provedor de e-mail (decisão 2). O envio fica atrás de uma interface simples em `core/notifications`, para trocar de provedor sem mexer no Radar.
- A chave do provedor fica só no servidor, validada em `core/config/env.ts`. Nunca em variável `NEXT_PUBLIC_*`.
- Os destinatários ficam em `data/radar/settings.json`, na branch `portal-state`.
- Fica separada de B2 de propósito: depende da infraestrutura e não pode travar o painel.

**Regra**
- Só o administrador altera destinatários.
- O aviso sai uma vez por requisição nova e uma vez por falha de cada execução.

**Desenho do fluxo** → `fluxo-radar-requisicoes-novas.png` (bloco 2)

---

## B4 — Fila de aprovação: enviar, aprovar e devolver alteração do manual

**Título da demanda:** Fila de aprovação: enviar, aprovar e devolver alteração do manual

**Resumo da evolução:** O editor do manual deixa de gravar direto e envia a
alteração para uma fila. A qualidade vê as pendentes, aprova ou devolve na
própria tela, sem abrir o GitHub.

**Contexto:** Hoje quem edita publica na hora. O EDI precisa de autonomia, mas
o distribuidor só pode ver o que a qualidade aprovou.

**Critérios de aceitação**

Enviar:
- O editor do manual tem o botão "Enviar para validação".
- Ao enviar, a alteração vira uma proposta e o distribuidor continua na versão atual.
- Editar de novo antes da aprovação atualiza a mesma proposta, sem abrir outra.
- Um checklist automático roda e barra proposta incompleta antes da qualidade.
- Proposta que mexe fora de `content/**` é reprovada.
- Se outra pessoa alterou o mesmo manual, o envio avisa e não sobrescreve.
- Senha, token e credencial nunca entram na proposta.
- Com o GitHub ligado, o editor não grava mais direto. No ambiente local de desenvolvimento, segue como hoje.

Aprovar e devolver:
- A tela `/admin/fila` lista as propostas com quem enviou, a data, o resumo, o resultado do checklist e o estado.
- Mostra o que mudou em linguagem simples, requisição por requisição e texto por texto, sem código.
- Aprovar publica no manual do distribuidor em segundos, sem esperar deploy.
- Devolver exige um motivo, que o EDI vê ao voltar para o editor.
- Quem enviou não consegue aprovar a própria alteração.
- Proposta parada há mais de 7 dias fica sinalizada.
- Fica registrado quem aprovou e quando.

**Outras informações**
- Fora desta demanda: tipo de versão e histórico (B5). Aqui a aprovação só publica.
- Entregar em commits por etapa: enviar, tela da fila, aprovar.
- Reaproveita `manual-quality.ts` e `content:validate-published`.
- A proposta é um Pull Request numa branch por manual (`content/<slug>/...`). O estado é o marcador do Pull Request, sem banco. A tela é só a interface.
- A aprovação é feita por uma GitHub App do portal. A pessoa fica registrada na proposta.
- Publicação em segundos: aviso do GitHub ao portal (webhook com assinatura verificada) que atualiza o cache.
- Novo módulo `modules/publicacao/`.
- Rascunho salvo no navegador (autosave) fica de fora.

**Regra**
- Nada que o EDI salva chega ao distribuidor sem aprovação.
- Uma proposta aberta por manual.
- Só revisor e administrador aprovam.
- A checagem "quem enviou não aprova" é feita no servidor, não só escondendo o botão.
- Aprovar publica direto em `main`.

**Desenho do fluxo** → `fluxo-fila-aprovacao-conteudo.png`

---

## B5 — Histórico de versões em dois tipos e restauração de versão anterior

**Título da demanda:** Histórico de versões em dois tipos e restauração de versão anterior

**Resumo da evolução:** Cada aprovação gera um registro. Se impacta o
distribuidor, sobe a versão do manual e aparece para ele. Se não impacta, fica
só em um histórico interno do EDI. A qualidade pode restaurar uma versão antiga
pela tela.

**Contexto:** Mudança de requisição afeta o cliente e ele precisa saber. Ajuste
de texto ou layout não pede nada dele e não deve poluir o histórico que ele vê.
Se uma alteração aprovada sair errada, é preciso voltar sem mexer em código. O
Git já guarda toda a história, então não existe cópia paralela para manter.

**Critérios de aceitação**

Histórico:
- Na aprovação, a qualidade escolhe o tipo. O portal sugere: requisição nova, removida ou renomeada sugere "versão do manual"; texto e layout sugerem "interna".
- Versão do manual: o número sobe (ex.: 1.1 → 1.2) e entra uma linha no histórico dentro do manual.
- Versão interna: o número do manual não muda e o registro fica só na área do EDI.
- O distribuidor não vê o histórico interno, nem por tela nem por API.
- O histórico do manual segue o padrão da imagem: **Data, Detalhes e Versão**, sem coluna de autor.
- A linha do histórico é gerada automaticamente (ex.: "Adicionada a query `nomeDaQuery`") e a qualidade pode complementar o texto.
- Alteração que mistura os dois tipos conta como versão do manual.
- Cada registro guarda a referência da versão aprovada.
- Manuais com histórico antigo (com autor) continuam abrindo normalmente.

Restauração:
- Cada linha dos dois históricos tem a ação "Restaurar esta versão".
- Restaurar abre uma nova proposta na mesma fila, e só vale depois da aprovação.
- O histórico anterior nunca é apagado. A restauração aparece como uma linha nova.
- Restaurar uma versão do manual gera nova versão do manual. Restaurar uma interna não muda o número do distribuidor.
- Só revisor e administrador restauram.
- Tirar o manual do ar continua imediato e fora da fila.

**Outras informações**
- Fora desta demanda: histórico por campo dentro de uma requisição. A imagem de exemplo cita campo novo dentro de uma query, mas o Radar só detecta requisição nova. O texto continua editável.
- O histórico interno fica num arquivo separado (`history-interno.json`), nunca dentro de `manual.json`, para não vazar por engano nas telas do distribuidor.
- Mudança de schema Zod: `author` deixa de ser obrigatório em `versionHistory` e entra o campo da referência da versão.
- Formato de versão passa a `X.Y`, como na imagem. Isso substitui o semver `x.y.z` do estudo.
- A restauração usa a leitura por versão criada em B1.
- Se a restauração trouxer risco, ela pode sair desta branch e virar uma demanda própria, sem afetar o histórico.

**Regra**
- Só a versão do manual altera o número que o distribuidor vê.
- A versão sobe na aprovação, nunca na edição.
- O histórico interno é visível apenas para editor, revisor e administrador.
- Restaurar é avançar com o conteúdo antigo, não reescrever a história. A restauração também exige aprovação.

**Desenho do fluxo** → `fluxo-dois-tipos-de-versao.png`. A restauração:
```text
qualidade escolhe a linha no histórico → portal lê o conteúdo daquela versão
   → abre proposta "restauração" na fila → aprovação → nova linha no histórico
```

---

## B6 — Levar requisição nova ao subproduto pela fila

**Título da demanda:** Levar requisição nova ao subproduto pela fila

**Resumo da evolução:** No painel do Radar, o EDI escolhe uma requisição nova e
a leva ao manual do subproduto. Ela passa pela mesma fila da qualidade.

**Contexto:** A requisição nova não pode entrar sozinha no subproduto. O EDI
decide se ela impacta o cliente e, se sim, a inclusão precisa de aprovação.

**Critérios de aceitação**
- No painel, cada requisição "nova" tem a ação "Levar para o subproduto".
- O formulário já vem com título, descrição e exemplo sugeridos a partir do schema. O EDI completa o que faltar.
- Há uma marcação "Gera versão nova para o distribuidor", ligada por padrão.
- Ao confirmar, a alteração entra na fila da qualidade e o estado da requisição vira "enviada para aprovação".
- Aprovada: a requisição entra no manual, o estado vira "publicada" e o histórico ganha a linha automática. Com a marcação ligada é versão do manual, desligada é versão interna.
- Devolvida: o estado volta a "nova" com o motivo.
- O distribuidor só vê a requisição depois da aprovação, inclusive na referência da API (`/docs/api`).

**Outras informações**
- Reaproveita `getSuggestedOperations` e `addManualOperationsBulk`.
- Depende da decisão 3: hoje a referência da API lista o schema inteiro. Sem filtrar pelo que está no manual, esta regra não se cumpre.

**Regra**
- Requisição nova nunca entra no manual sem passar pela fila.
- A marcação decide o tipo de versão sugerido, e a qualidade confirma na aprovação.

**Desenho do fluxo** → `fluxo-radar-requisicoes-novas.png` (blocos 2 e 3)
