---
title: Navbar de produtos EDI
status: atual
tags:
  - arquitetura
  - documentacao
  - navegacao
  - portal-edi
updated: 2026-09-18
---

# Navbar de produtos EDI

## Contrato atual

A área de documentação usa uma única navbar vertical e dinâmica. O conteúdo ocupa a coluna central e, quando um manual está aberto, o índice daquele documento ocupa a coluna direita em telas largas.

A navbar possui três estados no mesmo lugar:

1. lista de produtos;
2. áreas e integrações do produto escolhido;
3. áreas da integração aberta.

`DocumentationIntroduction` aparece somente no estado inicial de `/docs`. Ela não é repetida em páginas de produto, manual, operação ou Teste de Requisição.

## Rotas e retorno

O estado navegável é representado pela URL:

- `/docs`: início e lista de produtos;
- `/docs?produto={id}`: contexto de um produto;
- `/docs/{slug}`: documentação publicada de uma integração;
- `/docs/{slug}/operations/{kind}/{name}`: detalhe de operação;
- `/docs/{slug}/playground`: Teste de Requisição, quando autorizado.

Produtos e integrações publicadas usam `Link`, não estado local. Assim, recarregar a página, copiar a URL e usar voltar/avançar do navegador preserva o contexto.

Os retornos também são rotas:

- integração → `/docs?produto={id}`;
- produto → `/docs`;
- breadcrumb “Documentação” → `/docs`.

Canal Autorizador, Wholesaler e IM abrem diretamente suas rotas publicadas. EDI Redes e os demais itens sem manual publicado continuam visíveis e desabilitados; não são criadas páginas fictícias.

## Layout

- esquerda: uma única navbar vertical, fixa durante a rolagem em desktop;
- centro: introdução, visão do produto, manual, operação ou Teste de Requisição;
- direita: índice derivado de `tocItems`, exibido em desktop quando uma rota de manual está ativa.

Em telas menores, a navbar pode ser expandida e recolhida. Recolher a navbar não esconde o conteúdo. O índice lateral não disputa largura com o conteúdo fora do breakpoint desktop.

Os blocos antigos “Navegação” e “Operações” de `sidebarGroups` não são renderizados nas páginas públicas que usam a navbar de produtos. Queries, Mutations e Métodos aparecem no mesmo menu dinâmico somente quando existem operações daquele tipo.

## Fonte de verdade e fluxo de dados

`modules/living-docs-externa/config/documentation-products.ts` é o registro estrutural de produtos, ações e integrações. Inclusão ou exclusão estrutural permanece em código.

`getDocumentationNavigation` combina:

- configuração estrutural;
- sessão autenticada;
- manuais publicados;
- operações de cada manual.

`resolveDocumentationNavigation` aplica ordem, visibilidade, status e acesso. Somente rotas configuradas que correspondem a um manual publicado geram links.

No cliente, `ProductNavigation`:

- lê a rota com `usePathname`;
- lê o produto com `useSearchParams`;
- destaca produto, integração e área ativos;
- recebe o conteúdo da rota como `children`;
- recebe o índice pronto em `tocItems`.

Ocultar um item não substitui autorização de rota ou API. Claims ausentes falham fechados.

## Produtos configurados

- Credenciado: Cadastro, Opt-in, Venda e PBM direto no Caixa; placeholders.
- Movimentação de Vidas: estrutura futura para roteiro e integrações.
- Trade: Canal Autorizador, Wholesaler e IM publicados; EDI Redes como placeholder.
- APS: Delivery como placeholder; produto marcado “A confirmar”.
- PBM: Reposição como placeholder.
- Documentação (Clientes): área separada ainda sem conteúdo publicado.

Os estados visuais reutilizam `DocumentationStatusBadge` e `Badge`. O ambiente, como `homolog`, vem do manual publicado e usa `environmentBadgeTone`.

## Arquivos principais

- `app/docs/page.tsx`: introdução inicial.
- `modules/living-docs-externa/config/documentation-products.ts`: registro estrutural.
- `modules/living-docs-externa/schema/documentation-navigation.ts`: contrato de dados.
- `modules/living-docs-externa/services/documentation-navigation.ts`: resolução e seleção por rota.
- `modules/living-docs-externa/services/get-documentation-navigation.ts`: integração servidor/sessão.
- `modules/living-docs-externa/ui/reader/product-navigation.tsx`: navbar e composição das colunas.
- `modules/living-docs-externa/ui/reader/docs-shell.tsx`: entrada de `/docs`.
- `modules/living-docs-externa/ui/reader/manual-shell-with-nav.tsx`: manual e índice.
- `tests/e2e/product-navigation.spec.ts`: rotas diretas, rollback, responsividade e acesso administrativo.

## CodeGraph

O repositório possui `.codegraph/`; esse índice é local e seus dados transitórios não são versionados.

Depois de alterar este fluxo:

```bash
codegraph sync .
codegraph status .
codegraph explore "ProductNavigation documentation navigation routes"
```

Use `codegraph index .` somente quando for necessário reconstruir o índice completo. Para investigação, consulte CodeGraph antes de buscas textuais amplas.

## Obsidian

O cofre `obsidian/` é derivado do repositório. `docs/` entra no cofre como a pasta `obsidian/docs`, e os produtos publicados são gerados a partir de `content/projects`.

Depois de alterar documentação ou conteúdo:

```bash
npm run obsidian:sync
```

Durante edição contínua, use `npm run obsidian:watch`. Não edite arquivos gerados no cofre como fonte de verdade; edite `docs/` ou `content/`.

## Verificação mínima

```bash
npm run typecheck
npm run lint
npm test -- modules/living-docs-externa/services/documentation-navigation.test.ts
$env:PLAYWRIGHT_BROWSER_CHANNEL='chrome'; npm run test:e2e -- tests/e2e/product-navigation.spec.ts
```

O E2E deve validar acesso direto a Canal Autorizador, Wholesaler e IM, retorno por link, histórico do navegador, índice lateral e ausência de overflow no mobile.
