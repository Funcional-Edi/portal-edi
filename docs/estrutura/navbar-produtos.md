# Entrada do portal e navegação por produtos

## Decisões de interface

- `/` exibe somente o login centralizado quando não há sessão. Após o acesso, apresenta o Portal de Integração, a documentação, os fluxogramas e a sequência de implementação e validação; os atalhos vêm dos módulos permitidos para o perfil.
- `/docs` é a introdução à documentação: trilha de integração, preparativos, visão geral dos produtos e orientação sobre acesso e ambientes.
- A navegação de produtos é vertical. No celular, o menu pode ser expandido e recolhido. Produtos e seções usam botões acessíveis; módulos publicados usam links e itens futuros permanecem desabilitados.
- Não existe uma área separada chamada “Documentação (Clientes)”. Cliente, fornecedor e equipe EDI usam a mesma navegação, com permissões preservadas.
- O cabeçalho compartilhado identifica o tipo de acesso real da sessão: “Administrador” ou “Cliente”, inclusive no celular. Textos genéricos repetidos sobre público e permissões foram removidos da Home e da introdução; mensagens contextuais de acesso negado permanecem.
- Os cartões de famílias saíram da introdução. As rotas `/docs/edi-pharma` e `/docs/edi-varejo` continuam funcionando para compatibilidade.

## Inspeção: CodeGraph, aplicação e Obsidian

O índice `.codegraph/` foi consultado antes da implementação para localizar `HomePage`, `DocsHomePage`, `DocsShell`, `ManualShellWithNav`, `buildManualNav`, `Badge`, os registros de módulos e `canAccessModule`/`canAccessPath`.

O cofre `obsidian/`, incluindo `.obsidian`, existe. `scripts/sync-obsidian-vault.ts` deriva seus índices e operações de `content/projects/*/config.json`, `manual.json` e seções Markdown. O frontmatter registra `generated`, `slug` e `published`; o ambiente aparece no índice do produto. Mapas, ADRs e notas internas não são rotas públicas.

Há referências antigas a `/manual` no cofre e nos documentos de migração. A aplicação usa `/docs` e mantém o redirecionamento legado. O mapa gerado do Obsidian lista demo, IM e Wholesaler, enquanto o conteúdo atual também inclui Canal Autorizador. Nenhum nome do cofre foi transformado automaticamente em URL.

As famílias EDI Pharma/EDI Varejo do CMS e os produtos da nova navegação são classificações distintas. A configuração de navegação faz o agrupamento solicitado sem migrar os dados ou renomear os manuais existentes.

## Configuração e disponibilidade

`modules/living-docs-externa/config/documentation-products.ts` centraliza produtos, descrições, módulos, ações, ordem, visibilidade, status, tags e políticas de acesso.

- Credenciado: Cadastro, Opt-in, Venda e PBM direto no Caixa, ainda sem documentação.
- Movimentação de Vidas: estrutura para Documentação, Roteiro, Teste de Requisição, Queries e Mutations; sem conteúdos publicados.
- Trade: Canal Autorizador, Wholesaler e IM publicados; EDI Redes sem documentação.
- APS: Delivery sem documentação; produto identificado como “A confirmar”.
- PBM: Reposição sem documentação.

Somente manuais publicados recebem links: `/docs/canal-autorizador`, `/docs/wholesaler` e `/docs/im`. Roteiro usa a âncora `#roteiro-integracao`. O nome público “Teste de Requisição” reutiliza `/docs/{slug}/playground`, sem criar uma ferramenta duplicada.

`published` e `environment` continuam vindo do CMS. A tag `homolog` usa `environmentBadgeTone` e não representa a conclusão de uma homologação. Os estados Publicado, Sem documentação, Em desenvolvimento e Indisponível compartilham `DocumentationStatusBadge`, que reutiliza os tons do `Badge` existente.

## Acesso e evolução administrativa

`getDocumentationNavigation` resolve dados e sessão no servidor. `resolveDocumentationNavigation` filtra produtos, módulos e ações por perfil e permite regras futuras de permissão, usuário, organização e cliente. Restrições com claims ausentes não liberam acesso. Tanto a introdução quanto a navbar recebem os produtos já filtrados.

A sessão atual fornece o perfil existente. Não foi criada autenticação alternativa nem inferida uma organização a partir do e-mail. O login de desenvolvimento usado pelos testes já fazia parte do projeto.

Documentação publicada, referência API e fluxogramas mantêm o acesso normal para clientes. Administração continua restrita a `admin`; execução de requisições usa os controles de servidor existentes. Esconder um item do menu não substitui autorização na rota ou API.

Uma futura fonte de configuração administrativa deve fornecer overrides validados por ID no carregador de servidor. Inclusão e exclusão estrutural permanecem em código. Esta etapa não cria editor administrativo, API de configuração ou integração definitiva de claims SSO granulares.

## Arquivos principais

- Entradas: `app/page.tsx`, `app/docs/page.tsx`.
- Apresentação: `documentation-introduction.tsx`, `product-navigation.tsx`, `documentation-status.tsx`, `docs-shell.tsx`, `manual-shell.tsx` e `manual-shell-with-nav.tsx`, em `modules/living-docs-externa/ui/reader/`.
- Modelo e resolução: `schema/documentation-navigation.ts`, `config/documentation-products.ts`, `services/documentation-navigation.ts` e `services/get-documentation-navigation.ts`, no mesmo módulo.
- Consistência de rótulos: `build-manual-nav.ts`, `manual-roteiro.tsx`, `operation-detail.tsx` e `app/docs/[slug]/playground/page.tsx`.
- Apresentação dos recursos: registros dos módulos `living-docs-externa` e `graphql-reference`.
- Validação: `services/documentation-navigation.test.ts`, testes E2E de introdução, navbar, manuais, referência e compatibilidade de famílias. `playwright.config.ts` aceita `PLAYWRIGHT_BROWSER_CHANNEL=chrome`; Edge permanece como padrão.

## Validação realizada

- TypeScript, ESLint e regras de arquitetura aprovados.
- 49 arquivos de testes unitários/integração: 293 testes aprovados.
- 15 testes E2E selecionados aprovados no Chrome: introdução, login, navbar, navegação de manuais/referência, celular e acesso por perfil.
- Capturas de `/docs`, Home e login revisadas visualmente; testes de celular em 390 px confirmam ausência de rolagem horizontal nessas entradas.
- Cliente sem links administrativos, redirecionado de `/admin/projects` e `/interno`, e recebendo HTTP 403 ao tentar usar a API de requisições.
- Testes antigos atualizados para o administrador padrão e para o snapshot já existente de Wholesaler. O cenário de publicação sem snapshot continua coberto por `get-published-schema.test.ts`.

Não houve deploy ou alteração de credenciais. O texto introdutório é um esboço editorial a evoluir com o conteúdo e o escopo confirmados de cada produto.
