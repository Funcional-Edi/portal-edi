---
tipo: arquitetura
status: ativo
tags:
  - codegraph
  - arquitetura
  - produtividade
  - contexto
---

# CodeGraph — cérebro técnico do portal

## Objetivo

O CodeGraph é a camada de navegação técnica do projeto. Ele mantém símbolos,
relações entre arquivos, caminhos de chamada e impacto das alterações.

O Obsidian complementa o CodeGraph com contexto humano: regras de negócio,
decisões, operação, histórico e explicações que não aparecem diretamente no
código.

## Divisão de responsabilidades

| Camada | Responsabilidade | Perguntas respondidas |
| --- | --- | --- |
| Obsidian | Contexto funcional e decisões | Por que existe? Qual regra de negócio? Qual foi a decisão? |
| CodeGraph | Estrutura e relações do código | Onde está? Quem chama? O que será afetado? |
| Arquivos | Confirmação pontual | Qual é a implementação atual e a linha exata? |

Fluxo preferencial:

```text
Obsidian → contexto da tarefa
CodeGraph → símbolos e relações relevantes
Arquivo específico → confirmação final
```

## Comandos essenciais

Executar na raiz do repositório:

```powershell
codegraph status
codegraph sync
codegraph index
codegraph query cachePublishedContent
codegraph explore "listPublishedManuals cache published projects"
codegraph impact cachePublishedContent
codegraph affected modules/living-docs-externa/services/content-cache.ts
```

## Quando usar cada comando

- `status`: primeira verificação do índice.
- `sync`: depois de alterações normais em arquivos existentes.
- `index`: depois de checkout, merge amplo ou quando o índice disser que está atualizado, mas retornar código antigo.
- `query`: localizar um símbolo sem ler o repositório inteiro.
- `explore`: entender fluxo, dependências e despacho dinâmico.
- `impact`: avaliar o alcance de uma mudança antes de editar.
- `affected`: selecionar testes sem executar toda a suíte.

## Regra de economia de tokens

1. Ler esta nota e a documentação funcional relacionada no Obsidian.
2. Consultar o CodeGraph com uma pergunta específica.
3. Abrir apenas os arquivos e símbolos retornados como relevantes.
4. Executar somente os testes indicados pelo impacto, além da validação final necessária.
5. Registrar no Obsidian decisões novas ou descobertas reutilizáveis.

Evitar listar ou ler todo o repositório antes de formular a pergunta, repetir a
leitura de arquivos já retornados ou reconstruir o índice completo após toda
pequena alteração.

## Áreas importantes do portal

### Documentação viva

Símbolos principais:

- `getProject` — carrega um projeto individual;
- `listPublishedProjectSummaries` — filtra projetos com `published: true`;
- `listPublishedManuals` — catálogo público de manuais;
- `cachePublishedContent` — política de cache local e GitHub/Vercel;
- `syncObsidianVault` — gera e sincroniza referências no Obsidian.

Consulta recomendada:

```text
codegraph explore "fluxo de listPublishedManuals até FamilyCatalog para edi-pharma"
```

### Autenticação e Preview

Símbolos principais:

- `env.isDevAuthEnabled` — habilita acesso DEV local e em Preview Vercel;
- `validateEnv` — valida variáveis obrigatórias e restrições de produção;
- `core/auth/config.ts` — provedores e ordem de autenticação.

Consulta recomendada:

```text
codegraph explore "isDevAuthEnabled VERCEL_ENV preview auth config"
```

### Conteúdo remoto

Quando `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` e `GITHUB_TOKEN` estão
configurados, o backend usa o GitHub como CMS de leitura. No Vercel, essas
variáveis devem ficar no ambiente Preview quando o objetivo for testar sem
alterar a configuração de produção.

## Cache de conteúdo

`cachePublishedContent` aplica esta política:

- backend local: leitura atualizada dos arquivos a cada request;
- backend GitHub: cache com revalidação periódica;
- chave remota inclui namespace, repositório e commit do Vercel;
- tags permitem invalidação após alterações administrativas.

Ao diagnosticar conteúdo vazio ou antigo, verificar: `published: true`, família
em `config.json`, variáveis `GITHUB_*` no Preview, novo deployment após alterar
variáveis e versão atual dos serviços no CodeGraph.

## Decisões registradas

### ADR — Obsidian como contexto complementar

**Status:** ativo

O Obsidian não substitui o índice técnico. Ele registra contexto reutilizável e
reduz a necessidade de explicar novamente regras funcionais, decisões de
deploy e procedimentos de diagnóstico.

### ADR — CodeGraph como primeira consulta técnica

**Status:** ativo

Em repositórios com `.codegraph/`, consultas de entendimento e localização
devem começar pelo CodeGraph. A leitura direta de arquivos fica restrita à
confirmação dos pontos relevantes.

## Manutenção

- Atualizar esta nota quando mudar o fluxo de indexação, cache ou deploy.
- Registrar decisões operacionais em `obsidian/arquitetura/`.
- Manter o mapa principal apontando para esta nota.
- Não versionar bancos ou arquivos temporários gerados pelo índice.
