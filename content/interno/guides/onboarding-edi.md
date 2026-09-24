# Onboarding EDI — Portal de Integração

Guia de entrada e acompanhamento do portal modular do time EDI.

**Atualizado em:** 24/09/2026

## Visão atual do projeto

O portal concentra a documentação de produtos e subprodutos, os roteiros de
homologação, a referência GraphQL, os fluxogramas e os guias internos.

A navegação pública parte de `/docs`. A organização principal da referência
mantém a relação **produto → subproduto**, sem transformar as classificações
internas de família em títulos da documentação geral.

## Pontos importantes entregues

- **Documentação geral:** `/docs` apresenta a visão inicial e os produtos
  disponíveis.
- **Subproduto:** `/docs/{slug}` exibe o contexto, a Jornada da Integração, o
  Roteiro de Integração e as operações do produto.
- **Referência GraphQL:** `/docs/api` mantém a navegação por produto e
  subproduto.
- **Jornada da Integração:** apresenta a sequência macro das operações, com os
  endpoints em ordem e links indentados para o detalhamento publicado.
- **Roteiro de Integração:** possui uma seção própria para registrar
  pré-requisitos, entradas, respostas, decisões de continuidade, exceções e
  evidências de homologação por fluxo.
- **Queries e mutations:** cada operação orienta o leitor a consultar o Roteiro
  de Integração antes de executar a chamada.
- **Fluxograma:** `/fluxogramas/{slug}` apresenta o fluxo completo publicado.
- **Teste de requisição:** fica disponível para o perfil administrativo no
  playground do subproduto.
- **Navegação:** o retorno de um subproduto usa “Voltar aos produtos”, há
  retorno ao produto no fluxo e existe botão de voltar ao topo em páginas longas.
- **Compatibilidade:** URLs antigas em `/manual/*` continuam sendo aceitas e
  redirecionadas para `/docs/*` pelo middleware.
- **Âncoras:** `#jornada-integracao` identifica a sequência de operações;
  `#roteiro-integracao` identifica o novo roteiro técnico e continua válido
  para links antigos compartilhados.

## Atualização da EDI-14324

As principais frentes da issue foram incorporadas ao portal:

- remoção do PDF do fluxo principal da documentação;
- configuração da sessão geral **Referência GraphQL**;
- fluxograma completo na primeira seção do produto;
- padronização de **Roteiro de Homologação** nos produtos;
- processo de teste de requisição para o ambiente fornecedor;
- revisão da navegação entre produtos, subprodutos e operações;
- criação e organização da documentação de **Movimentação de Vidas**;
- atualização do subproduto para **Fluxo PBM no Caixa**;
- revisão do destaque ativo ao navegar para o roteiro por âncora.

## Atualização da EDI-14331

Nesta frente, a documentação dos subprodutos passou a separar a visão macro da
integração do detalhamento técnico:

- o conteúdo que era exibido como **Roteiro de Homologação** foi renomeado para
  **Jornada da Integração**;
- foi criado o item **Roteiro de Integração**, com estrutura própria para a
  documentação técnica por fluxo;
- a Jornada mantém os links indentados para as operações publicadas;
- as páginas de operação e o editor administrativo passaram a usar a nova
  nomenclatura;
- os links existentes para `#roteiro-integracao` continuam funcionando e
  apontam para a seção do novo roteiro;
- a mudança foi aplicada ao catálogo compartilhado, alcançando os
  subprodutos publicados e a estrutura dos próximos subprodutos.

## Papéis

- **Admin (EDI):** cria projetos, conecta gateway, sincroniza schema, cura
  manual, revisa qualidade, publica e acessa o teste de requisição.
- **Client (distribuidor):** consulta produtos publicados, segue a Jornada e o
  Roteiro de Integração e acessa as operações permitidas.

## Fluxo típico de um manual novo

1. Criar o slug em `/admin/projects/new`.
2. Conectar o gateway de homologação e sincronizar o schema.
3. Curar operações e seções no editor unificado em
   `/admin/projects/{slug}/edit`.
4. Conferir o checklist de qualidade e publicar.
5. Revisar a Jornada, o Roteiro de Integração, o fluxograma e a referência
   GraphQL em `/docs`.
6. Executar a homologação com as operações na ordem indicada.

## Onde ficam os arquivos

| Artefato | Caminho |
|----------|---------|
| Config do projeto | `content/projects/{slug}/config.json` |
| Manual curado | `content/projects/{slug}/manual.json` |
| Seções Markdown | `content/projects/{slug}/sections/*.md` |
| Fluxograma | `content/projects/{slug}/flow.json` |
| Schema de introspecção | `data/projects/{slug}/schema.json` |
| Credenciais do gateway | `data/projects/{slug}/credentials.enc` (gitignored) |
| Guia interno | `content/interno/guides/{slug}.md` |

## Desenvolvimento local

Use a raiz do projeto:

```powershell
cd D:\Projetos\portal-edi
npm.cmd install       # somente quando as dependências ainda não estiverem instaladas
npm.cmd run dev       # http://localhost:3002
```

O ambiente esperado usa Node.js 20. O `package.json` já configura o servidor
de desenvolvimento na porta 3002.

## Validação antes de uma entrega

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run arch
npm.cmd run test
npm.cmd run test:e2e
npm.cmd run build
```

Na última validação registrada:

- o índice do CodeGraph foi sincronizado e validado com 272 arquivos, 2.223
  nós e 5.197 relações;
- typecheck, lint, arquitetura e validação de conteúdo publicado passaram;
- a suíte unitária passou com 47 arquivos e 288 testes;
- os fluxos E2E de navegação, editor e REST passaram com 12 testes;
- o executor de scripts TypeScript trata a limitação `ENOMEM` do `tsx` no
  Windows, e os testes usam fallback local somente quando o diretório
  temporário do sistema bloqueia cópia recursiva;
- não há falhas `EPERM` pendentes nas validações executadas.

## Decisões técnicas recentes

- A camada `core/ai` permanece preparada para uma futura integração real em
  produção; o provedor atual é apenas um stub sem chamadas externas.
- O registro de módulos deixou de usar estado mutável e passou a trabalhar com
  o catálogo fixo de módulos conhecidos.
- A fachada `DataStore/getContentStore`, que não tinha consumidor de produção,
  foi removida.
- A regra arquitetural entre módulos foi corrigida; `npm.cmd run arch` não
  apresenta violações.

## Próximos pontos de acompanhamento

- detalhar o Roteiro de Integração por fluxo, começando pelo Canal Autorizador
  e replicando o modelo nos demais subprodutos publicados;
- homologar a navegação de todos os produtos e subprodutos publicados;
- confirmar em produção o redirect de `/manual/*` para `/docs/*`;
- validar o roteiro completo, incluindo queries, mutations e teste de requisição;
- decidir se o projeto `demo`, atualmente publicado no conteúdo mas fora do
  catálogo produto → subproduto, deve ser associado a um subproduto ou permanecer
  somente como conteúdo interno de desenvolvimento;
- atualizar este guia sempre que uma nova frente de produto ou documentação for
  publicada.
