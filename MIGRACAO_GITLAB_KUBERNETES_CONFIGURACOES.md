# Migração do Portal EDI para GitLab e Kubernetes

## Objetivo

Documentar as configurações necessárias para substituir a integração atual com o GitHub por uma integração com o GitLab e executar o Portal EDI em Kubernetes.

As configurações da aplicação serão fornecidas pelo Kubernetes por meio de:

- `Secret`: credenciais, tokens e dados sensíveis;
- `ConfigMap`: URLs, identificadores, branch e demais configurações não sensíveis;
- `Deployment`: injeção das configurações no container da aplicação.

## Repositório dos manifests não produtivos

O manifesto `configmap.yml` do Portal EDI deverá ser adicionado ao repositório GitLab de infraestrutura não produtiva:

```text
funcional-health-tech/infra/sre/devsecops/k8s-manifests-nonprod
```

Esse repositório é o destino das configurações aplicadas em `doc-center-dev.funcionalcorp.net.br`. O `configmap.yml` deve conter somente dados não sensíveis; `GITLAB_TOKEN`, `GITLAB_WRITE_TOKEN`, `AUTH_SECRET` e `LOCAL_EMERGENCY_ACCOUNTS_JSON` permanecem em um `Secret` gerenciado pela infraestrutura.

## Variáveis atualmente utilizadas pelo GitHub

As variáveis abaixo pertencem à integração atual e deverão ser removidas depois que a integração com o GitLab estiver validada:

```env
GITHUB_REPO_OWNER
GITHUB_REPO_NAME
GITHUB_TOKEN
GITHUB_WRITE_TOKEN
GITHUB_CONTENT_REF
```

Durante a migração, elas não devem ser reutilizadas para representar configurações do GitLab. O código deverá utilizar um adaptador específico para o novo provedor.

## Variáveis do GitLab

A nova integração deverá utilizar as seguintes variáveis:

```env
GITLAB_BASE_URL
GITLAB_PROJECT_ID
GITLAB_TOKEN
GITLAB_WRITE_TOKEN
GITLAB_CONTENT_REF
```

### Descrição das variáveis

| Variável | Tipo | Finalidade |
| --- | --- | --- |
| `GITLAB_BASE_URL` | Configuração | URL da instância do GitLab. Para GitLab.com, utilizar `https://gitlab.com`. |
| `GITLAB_PROJECT_ID` | Configuração | Identificador do projeto no GitLab. O ID numérico é preferível ao nome do projeto. |
| `GITLAB_TOKEN` | Secreto | Token utilizado para leitura do conteúdo. |
| `GITLAB_WRITE_TOKEN` | Secreto | Token utilizado para criação de arquivos, árvores, commits e atualização da branch. |
| `GITLAB_CONTENT_REF` | Configuração | Branch ou referência utilizada pelo conteúdo, inicialmente `homolog`. |

Se o adaptador utilizar namespace e nome do projeto em vez do ID numérico, estas variáveis poderão substituir `GITLAB_PROJECT_ID`:

```env
GITLAB_REPO_NAMESPACE
GITLAB_REPO_NAME
```

Essa escolha deve ser padronizada no código antes da criação dos manifestos definitivos.

## Kubernetes Secret

O `Secret` deverá armazenar somente valores sensíveis.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: portal-edi-secrets
type: Opaque
stringData:
  GITLAB_TOKEN: "<token-de-leitura>"
  GITLAB_WRITE_TOKEN: "<token-de-escrita>"
  AUTH_SECRET: "<segredo-de-autenticacao>"
  LOCAL_EMERGENCY_ACCOUNTS_JSON: "<contas-de-emergencia>"
```

### Regras para o Secret

- Nunca colocar tokens reais no Git.
- Nunca colocar tokens no `ConfigMap`.
- Nunca imprimir tokens nos logs.
- Não enviar tokens pelo chat ou por issues.
- Utilizar um token separado para leitura e escrita quando possível.
- Se for utilizado o mesmo token, ele deverá possuir permissão suficiente para leitura e escrita.
- O token de escrita deve possuir acesso somente ao projeto necessário.

O manifesto acima deve ser aplicado por um mecanismo seguro de secrets, como o gerenciador de segredos adotado pela infraestrutura. Os valores de exemplo não devem ser utilizados em ambiente real.

## Kubernetes ConfigMap

O `ConfigMap` deverá conter somente configurações não sensíveis.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: portal-edi-config
data:
  GITLAB_BASE_URL: "https://gitlab.com"
  GITLAB_PROJECT_ID: "<id-do-projeto>"
  GITLAB_CONTENT_REF: "homolog"
  SSO_URL_ALLOWED_HOSTS: "<hosts-permitidos-do-sso>"
  FUNCIONAL_SSO_GRAPHQL_URL: "<url-do-graphql-do-sso>"
  GATEWAY_URL_ALLOWED_HOSTS: "<hosts-permitidos-do-gateway>"
  AUTH_URL: "<url-de-autenticacao>"
  AI_PROVIDER: "<provedor-de-ia>"
  DEV_AUTH_ENABLED: "false"
```

### Regras para o ConfigMap

- Não armazenar tokens, senhas ou chaves privadas.
- Não armazenar `AUTH_SECRET`.
- Não armazenar `GITLAB_TOKEN` ou `GITLAB_WRITE_TOKEN`.
- Manter `GITLAB_CONTENT_REF` como `homolog` no ambiente de homologação.
- Utilizar valores diferentes por ambiente quando necessário.

## Deployment

O `Deployment` deverá injetar o `ConfigMap` e o `Secret` como variáveis de ambiente do container.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: portal-edi
spec:
  template:
    spec:
      containers:
        - name: portal-edi
          image: <imagem-do-portal-edi>
          envFrom:
            - configMapRef:
                name: portal-edi-config
            - secretRef:
                name: portal-edi-secrets
```

Com essa configuração, a aplicação continuará lendo os valores por meio de `process.env`:

```ts
process.env.GITLAB_BASE_URL
process.env.GITLAB_PROJECT_ID
process.env.GITLAB_TOKEN
process.env.GITLAB_WRITE_TOKEN
process.env.GITLAB_CONTENT_REF
```

Não é necessário alterar a forma de leitura das variáveis apenas porque a aplicação será executada em Kubernetes. O Kubernetes fornecerá os valores ao processo da aplicação.

## Configuração esperada em homologação

O ambiente de homologação deverá utilizar:

```env
GITLAB_CONTENT_REF=homolog
```

O fluxo deverá:

- ler o conteúdo da branch `homolog`;
- realizar gravações controladas na branch `homolog`;
- impedir escrita direta em `main`;
- impedir escrita direta em `master`;
- evitar `force push`;
- rejeitar conflitos de atualização;
- permitir escrita somente nos diretórios autorizados.

Os diretórios atualmente autorizados são:

```text
content/
data/radar/
data/access/
```

## Alterações necessárias na aplicação

O projeto utiliza atualmente uma implementação específica para o GitHub. Essa implementação deverá ser substituída ou complementada por uma implementação para o GitLab.

Arquivo atual relacionado ao GitHub:

```text
core/db/adapters/github-content-store.ts
```

Novo adaptador sugerido:

```text
core/db/adapters/gitlab-content-store.ts
```

O adaptador GitLab deverá preservar o contrato utilizado pela aplicação e oferecer as mesmas operações:

- buscar conteúdo;
- listar arquivos;
- consultar a branch;
- criar arquivos;
- criar blobs ou equivalente na API do GitLab;
- criar a árvore de alterações;
- criar o commit;
- atualizar a referência da branch;
- bloquear branches protegidas;
- validar caminhos autorizados;
- tratar conflitos de atualização;
- retornar erros compreensíveis para a interface.

## Permissões do GitLab

O token deverá ser criado com acesso restrito ao projeto do Portal EDI.

O escopo mínimo depende da implementação escolhida:

```text
read_repository
write_repository
```

Se o adaptador utilizar diretamente a API REST do GitLab para criar commits e atualizar arquivos, poderá ser necessário o escopo:

```text
api
```

O escopo final deve ser definido depois que o adaptador GitLab for implementado. Deve ser utilizado o menor nível de permissão que atenda ao fluxo.

## Exemplo de ambiente local

Para testes locais, pode ser utilizado um arquivo `.env.local` que não seja versionado:

```env
GITLAB_BASE_URL=https://gitlab.com
GITLAB_PROJECT_ID=<id-do-projeto>
GITLAB_TOKEN=<token-de-leitura>
GITLAB_WRITE_TOKEN=<token-de-escrita>
GITLAB_CONTENT_REF=homolog
```

O arquivo `.env.local` deve permanecer fora do repositório e nunca deve ser enviado ao GitLab.

## Migração das variáveis no ambiente de hospedagem

Depois que o Kubernetes estiver preparado, as variáveis antigas do GitHub deverão ser retiradas do ambiente anterior:

```text
GITHUB_REPO_OWNER
GITHUB_REPO_NAME
GITHUB_TOKEN
GITHUB_WRITE_TOKEN
GITHUB_CONTENT_REF
```

Antes da remoção, confirmar que as variáveis do GitLab já estão disponíveis no pod:

```text
GITLAB_BASE_URL
GITLAB_PROJECT_ID
GITLAB_TOKEN
GITLAB_WRITE_TOKEN
GITLAB_CONTENT_REF
```

## Checklist de validação

### Configuração

- [ ] Projeto criado ou migrado para o GitLab.
- [ ] Branch `homolog` disponível no GitLab.
- [ ] `GITLAB_PROJECT_ID` confirmado.
- [ ] `GITLAB_BASE_URL` confirmado.
- [ ] Token de leitura criado.
- [ ] Token de escrita criado.
- [ ] `Secret` criado no cluster.
- [ ] `ConfigMap` criado no cluster.
- [ ] `Deployment` configurado para consumir os dois recursos.
- [ ] Nenhum segredo incluído no repositório.

### Aplicação

- [ ] Adaptador GitLab implementado.
- [ ] Leitura da documentação funcionando.
- [ ] Gravação de arquivo de teste funcionando.
- [ ] Commit criado na branch `homolog`.
- [ ] Bloqueio de `main` validado.
- [ ] Bloqueio de `master` validado.
- [ ] Restrição de diretórios validada.
- [ ] Conflito de atualização tratado.
- [ ] Reinício do pod validado sem perda das configurações.
- [ ] Tokens ausentes ou inválidos retornam erro seguro.
- [ ] Tokens não aparecem nos logs.

### Remoção do GitHub

- [ ] Integração GitLab validada em homologação.
- [ ] Deploy validado em Kubernetes.
- [ ] Leitura e escrita confirmadas no GitLab.
- [ ] Variáveis antigas do GitHub removidas do ambiente de hospedagem.
- [ ] Código específico do GitHub removido ou desativado.
- [ ] Documentação de operação atualizada.

## Arquitetura final

```text
Kubernetes Secret
    ├── GITLAB_TOKEN
    ├── GITLAB_WRITE_TOKEN
    ├── AUTH_SECRET
    └── LOCAL_EMERGENCY_ACCOUNTS_JSON

Kubernetes ConfigMap
    ├── GITLAB_BASE_URL
    ├── GITLAB_PROJECT_ID
    ├── GITLAB_CONTENT_REF
    └── demais configurações públicas

                ↓

             Deployment

                ↓

                Pod

                ↓

            process.env

                ↓

        GitLab Content Store

                ↓

              GitLab
```

## Resultado esperado

Ao final da migração:

1. O Portal EDI será executado em Kubernetes.
2. As configurações públicas serão fornecidas pelo `ConfigMap`.
3. Os tokens e segredos serão fornecidos pelo `Secret`.
4. A documentação será lida e alterada por meio do GitLab.
5. A branch `homolog` continuará sendo utilizada para validação.
6. `main` e `master` permanecerão protegidas contra escrita pela aplicação.
7. Nenhuma credencial ficará armazenada no código-fonte.
