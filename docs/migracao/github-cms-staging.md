# GitHub CMS — staging / homolog (ADR-0009)

Como apontar o portal para conteúdo versionado no GitHub em vez do filesystem local.

## Quando usar

| Ambiente | Backend recomendado |
|----------|---------------------|
| Dev local | `local` (default — pastas `content/` e `data/` no repo) |
| Homolog / prod | `github` — conteúdo centralizado, deploy stateless |

Seleção automática em `core/db/adapters/index.ts`: se `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` e `GITHUB_TOKEN` estiverem definidos, leituras usam Octokit.

## Variáveis

```env
GITHUB_REPO_OWNER=Funcional-Edi
GITHUB_REPO_NAME=portal-edi-content    # repo só com content/ + data/ (ou monorepo)
GITHUB_TOKEN=ghp_...                   # fine-grained: Contents read (write na Fase 3+ remota)
# CONTENT_ROOT=/app                    # opcional; paths relativos ao root do CMS no repo
```

## Layout esperado no repo CMS

Igual ao legado (paridade ADR-0009):

```text
content/projects/{slug}/config.json
content/projects/{slug}/manual.json
content/projects/{slug}/sections/*.md
data/projects/{slug}/schema.json
data/projects/{slug}/credentials.enc   # nunca no Git — só runtime/secrets
```

## Limitações atuais

- **Leitura** remota: implementada (`readGithubJson`, `readGithubText`).
- **Escrita** remota (admin connect/sync/edit): ainda lança erro — homolog EDI usa backend local ou aguarda Fase futura de write GitHub.
- Cache: services usam `unstable_cache` + tags (`LIVING_DOCS_CACHE_TAGS`); após publish local, `revalidateTag` invalida. Em GitHub puro, TTL do cache prevalece até redeploy ou tag manual.

## Fluxo planejado para escrita controlada

O portal não deve fazer `git push` diretamente na branch de produção nem gravar
credenciais no conteúdo. Quando a edição administrativa precisar persistir no
GitHub, o fluxo deverá ser:

1. O administrador salva uma alteração autenticada no portal.
2. O servidor valida o payload com os schemas do módulo e cria uma branch de
   trabalho isolada.
3. O adapter GitHub grava somente os arquivos permitidos nessa branch, usando a
   API de Contents/commits e o SHA atual para detectar conflito.
4. O servidor abre um Pull Request com resumo, autor, ambiente e validações
   executadas; a branch protegida não recebe escrita direta.
5. CI e os responsáveis pelo repositório validam e aprovam o PR. O merge é a
   operação que promove o conteúdo versionado.
6. O deploy de homologação ou produção ocorre conforme a política do repositório
   e atualiza o conteúdo lido pelo portal.

## Salvamento automático — alternativas B e C

O GitHub deve ser tratado como repositório versionado de conteúdo, não como um
banco de dados e nem como destino de uma gravação a cada tecla digitada.

### Alternativa B — autosave local e envio confirmado

O portal salva o rascunho automaticamente apenas no navegador. O conteúdo só é
enviado ao backend quando o usuário confirma **Salvar versão** ou **Enviar para
validação**.

```text
Edição no portal
    ↓
Rascunho local no navegador
    ↓
Usuário confirma o salvamento
    ↓
Sessão SSO + permissão EDI
    ↓
Commit em branch de manutenção
    ↓
Pull Request para homolog
```

Esse modo reduz a transmissão de conteúdo incompleto e deve ser usado quando o
material ainda for provisório ou exigir conferência individual antes de sair do
navegador.

Limitações:

- o rascunho não fica disponível automaticamente em outro dispositivo;
- ele pode ser perdido se o armazenamento local do navegador for apagado;
- não atende edição simultânea entre várias pessoas.

### Alternativa C — autosave híbrido

O portal mantém o rascunho local durante a edição e permite checkpoints
versionados no GitHub pelo backend protegido.

```text
Edição no portal
    ↓
Rascunho local imediato
    ↓
Intervalo sem edição ou ação "Salvar versão"
    ↓
Sessão SSO + permissão EDI
    ↓
Commit agrupado na branch da issue
    ↓
Pull Request atualizado para homolog
```

Regras:

- o rascunho local é salvo imediatamente;
- o checkpoint remoto não ocorre a cada tecla;
- alterações devem ser agrupadas por seção, fluxo ou etapa;
- o intervalo inicial pode ser de 30 a 60 segundos após a última alteração;
- a interface deve informar se o conteúdo está salvo localmente, versionado ou
  aguardando envio;
- falhas no GitHub não podem apagar o rascunho local;
- o checkpoint deve usar a branch da issue, como `edi-14333`;
- nenhuma escrita automática pode ocorrer diretamente em `homolog` ou `main`.

O modo C é o recomendado para o uso normal, porque combina recuperação local,
continuidade entre etapas e histórico versionado. O modo B deve continuar
disponível para conteúdos mais sensíveis ou para o primeiro envio de uma
manutenção.

### Conteúdo proibido no autosave

Nenhum dos dois modos pode armazenar:

- senhas;
- tokens de acesso;
- chaves privadas;
- credenciais de gateway;
- dados pessoais de beneficiários;
- dados reais de clientes;
- arquivos `.env`;
- secrets de infraestrutura.

O autosave deve operar apenas sobre conteúdo editorial e configurações
permitidas pelo contrato do portal. Credenciais de runtime continuam fora do Git
e devem permanecer em secret manager ou variável segura do ambiente.

## Acesso SSO e manutenção do EDI

O CRUD de conteúdo deve exigir duas condições independentes:

1. sessão autenticada pelo SSO;
2. autorização explícita para manutenção do Portal EDI.

O domínio do e-mail não deve ser usado sozinho como autorização. Liberar
automaticamente `@funcionalcorp.com.br` ou um domínio de colaboradores externos
concederia acesso a pessoas que podem não participar da manutenção do portal.

### Modelo preferencial

Criar grupos no provedor de identidade/SSO:

```text
PORTAL_EDI_CONTENT_EDITORS
PORTAL_EDI_REVIEWERS
PORTAL_EDI_PUBLISHERS
```

O SSO deve retornar o e-mail e os grupos/permissões do usuário. O portal pode
mapear esses grupos para capacidades:

- `content_editor`: edita e salva na branch da issue;
- `content_reviewer`: revisa alterações destinadas à homologação;
- `content_publisher`: participa da aprovação para produção.

Enquanto os grupos não estiverem disponíveis, utilizar uma allowlist de
endereços exatos em variável segura do ambiente. Não usar uma allowlist por
domínio amplo.

### Endereço `edi@funcionalcorp.com.br`

O endereço `edi@funcionalcorp.com.br` pode ser utilizado como:

- caixa de entrada do time;
- lista de distribuição;
- destinatário de notificações de manutenção;
- endereço de contato da auditoria;
- canal de alertas de Pull Requests e falhas de validação.

Não utilizar esse endereço como conta compartilhada de login ou identidade única
dos commits. A aprovação e a alteração precisam permanecer vinculadas ao
usuário humano autenticado.

### Viabilidade de `ediauditoria@funcionalcorp.com.br`

O endereço `ediauditoria@funcionalcorp.com.br` é viável como caixa de auditoria
ou grupo de recebimento, desde que seja criado e administrado pela equipe
responsável pelo Microsoft 365/SSO.

Ele pode receber eventos de:

- criação de branch;
- criação e atualização de Pull Request;
- commits realizados;
- aprovações e solicitações de alteração;
- falhas de testes;
- tentativas de acesso negadas;
- promoção de `homolog` para `main`;
- publicação em produção.

Esse endereço não deve ser a única identidade autorizada a alterar o portal. Se
for necessário um processo automatizado sem login humano, utilizar uma GitHub
App ou conta técnica controlada pela infraestrutura, com permissões mínimas e
sem uso interativo.

## Regras de segurança para o CRUD versionado

- o token do GitHub permanece somente no servidor;
- o navegador nunca recebe credenciais da GitHub API;
- a escrita ocorre por GitHub App ou token fine-grained armazenado em variável
  segura;
- o token possui somente as permissões necessárias para conteúdo e Pull
  Requests;
- a API aceita apenas caminhos permitidos de `content/`;
- `.env`, workflows, infraestrutura e arquivos de credenciais são bloqueados;
- a API rejeita caminhos absolutos, `..` e tentativas de sair da raiz de
  conteúdo;
- as APIs de escrita repetem a autorização no servidor, mesmo que a tela já
  esteja protegida;
- falhas retornam mensagens sanitizadas e não expõem tokens ou respostas brutas
  do GitHub;
- o usuário humano é mantido no histórico da operação;
- secret scanning e push protection devem ser habilitados quando disponíveis;
- o usuário que cria uma alteração não deve conseguir aprovar sozinho sua
  publicação.

## Aprovação e visibilidade

A aprovação oficial deve permanecer no Pull Request do GitHub, que já registra o
diff, os comentários, os revisores, os checks e o merge.

O portal pode oferecer uma tela de acompanhamento somente leitura com:

- issue relacionada;
- autor da manutenção;
- branch de origem e destino;
- último commit;
- status dos testes;
- Deploy Preview;
- revisores solicitados;
- aprovações recebidas;
- pendências;
- ambiente atual.

O portal não deve manter uma aprovação paralela que não seja refletida no
Pull Request. Se futuramente houver um botão de aprovação no portal, ele deverá
registrar uma revisão oficial no GitHub usando a identidade autorizada do
usuário.

## Fluxo de branches

```text
edi-14333 / maintenance-EDI-14333
        ↓ Pull Request
homolog
        ↓ Pull Request após validação
main
```

Regras mínimas:

- não realizar commit direto em `homolog` ou `main`;
- executar testes e validações antes do merge;
- solicitar revisão do time de EDI para `homolog`;
- solicitar aprovação distinta para a promoção de `homolog` para `main`;
- restringir a publicação de produção a uma branch protegida e a um ambiente
  com aprovação obrigatória;
- manter o histórico de commits e Pull Requests como auditoria da alteração.

## Critérios de aceite da solução

- o modo B permite editar sem transmitir automaticamente o conteúdo ao GitHub;
- o modo C mantém rascunho local e checkpoints versionados agrupados;
- uma falha de comunicação não apaga o rascunho local;
- somente usuários SSO autorizados pelo grupo ou allowlist do EDI executam o
  CRUD;
- `edi@funcionalcorp.com.br` recebe notificações sem funcionar como login
  compartilhado;
- `ediauditoria@funcionalcorp.com.br` recebe eventos de auditoria sem ser a
  identidade única de alteração;
- cada ação permanece associada ao usuário humano que a iniciou;
- nenhuma alteração é gravada diretamente em `homolog` ou `main`;
- a branch da issue recebe o commit e o Pull Request para validação;
- a promoção para `main` exige revisão distinta da edição;
- conteúdo sensível não entra no autosave nem no repositório;
- as APIs repetem as validações de autorização no servidor;
- o histórico de versões não depende de banco de dados.

Enquanto essa etapa não existir, `GITHUB_TOKEN` deve permanecer com permissão de
leitura. A implementação futura precisa separar token de leitura e token de
escrita, limitar caminhos permitidos, registrar o PR retornado e tratar conflitos
de SHA/rebase sem sobrescrever alterações de outro administrador.

## Validar configuração

```bash
# Com GITHUB_* no .env.local:
npm run smoke:homolog
curl -s http://localhost:3002/api/health | jq '.content'
# Esperado: { "backend": "github", "githubConfigured": true }
```

## Staging típico

1. Branch `content/homolog` no repo CMS com projetos `im`, `demo` publicados.
2. Token de leitura no secret manager do deploy.
3. `AUTH_SECRET` + SSO homolog no `.env` do runtime.
4. Smoke SSO após deploy (ver `fase-5-smoke-sso-homolog.md`).
