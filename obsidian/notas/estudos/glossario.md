# Glossário

Termos que aparecem neste projeto, com o significado **no contexto dele**.

## Arquitetura

| Termo | O que é |
| --- | --- |
| **Bounded context** | Pedaço de negócio com fronteira própria. Aqui: cada pasta em `modules/` |
| **Camada** | Nível de responsabilidade: `schema` → `repository` → `services` → `ui` |
| **ADR** | *Architecture Decision Record*. Um arquivo por decisão, com contexto e consequência |
| **BFF** | *Backend For Frontend*. Backend que existe só para servir esta UI (as `route.ts`) |
| **Adapter** | Troca a implementação sem mudar quem usa (local vs. GitHub em `core/db/adapters`) |
| **Repository** | Camada que só lê/grava dados. Sem regra de negócio |
| **Service** | Camada de regra de negócio. Sem React, sem `fs` |
| **Stateless** | Sem estado próprio no servidor. Aqui: sem banco até um módulo exigir |
| **Capability** | Capacidade de dados que um módulo declara precisar (`requiresCapabilities`) |

## Next.js / React

| Termo | O que é |
| --- | --- |
| **App Router** | Roteamento por pastas em `app/`. Arquivo = rota |
| **Server Component** | Renderiza no servidor. Padrão no App Router. Pode ler arquivo e segredo |
| **Client Component** | Renderiza no browser. Precisa de `"use client"`. Necessário para `useState`, `onClick` |
| **Hydration** | Momento em que o React "assume" o HTML que veio do servidor |
| **Route Handler** | `route.ts` — endpoint HTTP (GET, POST, PUT, DELETE) |
| **Middleware** | Código que roda **antes** de toda requisição (`middleware.ts`) |
| **SSR / SSG / ISR** | Render no servidor a cada request / na build / na build com revalidação |
| **Slot / children** | Injetar conteúdo dentro de um componente (usado no editor da Fase 6) |
| **AppShell / AppHeader** | Casca visual compartilhada em `core/ui` (marca, nav, ações). Ver ADR-0010 |
| **`loading.tsx`** | Arquivo Next.js que mostra skeleton **enquanto** a rota carrega (melhora percepção no clique) |
| **`React.cache()`** | Dedupe de função async **na mesma request** (layout + page não relê disco 2x) |
| **Geist** | Fonte do portal (`geist` + CSS variables no `app/layout.tsx`) |
| **lucide-react** | Biblioteca de ícones SVG usada na home, login e catálogo |
| **Fuse.js** | Busca fuzzy client-side/server-side; índice montado em `build-search-index.ts` |
| **CommandPalette** | Modal de busca global (`Ctrl+K`) em `core/ui/command-palette.tsx` |
| **`permissions.json`** | RBAC externo em `data/` — admins/clients sem editar código (Fase B/9) |
| **Compliance** | Módulo admin `/compliance` — catálogo de controles de proteção de dados |
| **RBAC** | *Role-Based Access Control* — papéis `admin` e `client` por e-mail |
| **CSP** | *Content Security Policy* — header que restringe scripts/recursos carregados |
| **CSRF** | Ataque que força ação autenticada de outro site; mitigado com Origin + SameSite |
| **SSRF** | Servidor acessa URL interna maliciosa; bloqueado em `gateway-url.ts` |

## TypeScript

| Termo | O que é |
| --- | --- |
| **Narrowing** | TS reduzir o tipo pelo fluxo do código (`if (!x) return` → depois `x` existe) |
| **`z.infer`** | Extrair o tipo TS a partir de um schema Zod (uma fonte só de verdade) |
| **Type guard** | Função que prova um tipo (`x is Foo`) |
| **`unknown`** | "Não sei o tipo" — obriga validar antes de usar. Preferível a `any` |
| **Generic** | Tipo parametrizado (`Array<string>`) |

## Git

| Termo | O que é |
| --- | --- |
| **Working directory** | Seus arquivos como estão agora |
| **Staging / index** | Área do que vai entrar no próximo commit (`git add`) |
| **Commit** | Ponto salvo no histórico, com mensagem |
| **Branch** | Linha do tempo independente de commits |
| **Remote / origin** | Repositório no servidor. `origin` = o padrão (GitHub) |
| **Upstream** | Branch remota vinculada à sua local (`push -u`) |
| **PR / Pull Request** | Pedido de revisão para juntar sua branch na `main` |
| **Merge** | Juntar duas linhas do tempo |
| **Conflito** | Mesma linha mudou nos dois lados — você decide qual fica |
| **Stash** | Gaveta temporária para trabalho pela metade |
| **HEAD** | Onde você está agora. `HEAD~1` = um commit atrás |

## Qualidade

| Termo | O que é |
| --- | --- |
| **CI** | *Continuous Integration*. Aqui: `npm run ci` (typecheck→lint→arch→test→build) |
| **Lint** | Análise estática de padrão de código (ESLint) |
| **Typecheck** | Verificar tipos sem gerar arquivo (`tsc --noEmit`) |
| **Teste unitário** | Testa uma função isolada (Vitest) |
| **Teste E2E** | Testa o fluxo no navegador de verdade (Playwright) |
| **Mock** | Substituto falso de uma dependência, para isolar o teste |
| **Coverage** | % de código executado pelos testes |
| **dependency-cruiser** | Ferramenta que verifica as regras de import (`npm run arch`) |

## Domínio do Portal EDI

| Termo | O que é |
| --- | --- |
| **Documentação viva** | Manual que acompanha o schema real da API, não um PDF parado |
| **Gateway** | API GraphQL da Fidelize que o distribuidor consome |
| **SSO** | *Single Sign-On*. Login corporativo que abre o portal |
| **Introspection** | Consulta que pede ao GraphQL o próprio schema |
| **Allowlist** | Lista do que é permitido. Aqui: só operações do `manual.json` no playground |
| **Manual / Roteiro** | Sequência ordenada de operações que o distribuidor deve seguir |
| **Section** | Bloco Markdown de contexto (`sections/*.md`) |
| **Operation** | Operação GraphQL documentada (`query` ou `mutation`) |
| **Publish** | Tornar o manual visível ao distribuidor (`published: true`) |
| **Quality check** | Validação que **bloqueia** publish se o manual estiver incompleto |
| **Distribuidor** | Cliente externo que lê o manual |
| **CMS em arquivos** | Conteúdo em `content/` no Git, sem banco (ADR-0009) |
| **Seed-only** | Conteúdo de exemplo local para fluxo/tela, ainda sem paridade real com o legado |
| **IntegrationFlow** | Diagrama BPMN curado em `flow.json` — nós (`start`, `operation`, `decision`, `end`) + arestas |
| **React Flow** | Biblioteca `@xyflow/react` para canvas de nós/arestas no browser |
| **Mermaid** | Linguagem texto → diagrama; export do fluxo via `exportFlowToMermaid` |
| **Família de produto** | Agrupamento visual (EDI Pharma, EDI Varejo) no catálogo/admin — metadata em `config.json`, não muda rota nem credenciais |
| **Protocolo REST vs GraphQL no portal** | `config.protocol` (`"graphql"` \| `"rest"`) define como um projeto é lido: GraphQL usa `graphqlUrl`, playground e `exampleQuery`; REST usa `apiBaseUrl`, sem playground, e cada operação (`kind: "rest"`) tem `method`/`path`/`exampleBody` em vez de query. Toda a cadeia (schema, quality gate, exports, UI, admin) faz esse branch — ver `modules/living-docs-externa/schema/manual.ts` e `project.ts` |

## Segurança

| Termo | O que é |
| --- | --- |
| **SSRF** | Fazer o servidor chamar uma URL maliciosa. Bloqueado em `core/security/gateway-url.ts` |
| **Rate limit** | Limitar tentativas. Login: 10 / 15 min |
| **JWT** | Token assinado que carrega a sessão (8h, httpOnly aqui) |
| **httpOnly** | Cookie que o JavaScript do browser **não** consegue ler |
| **RBAC** | Controle de acesso por papel (`core/auth/roles`) |
| **`module-access`** | Funções `canAccessModule` / `canAccessPath` — permitem rota conforme `access` do módulo |
| **`UserRole`** | `admin` (EDI) ou `client` (distribuidor, default após SSO) |
| **Porta única** | `/` = login (deslogado) ou hub (logado); `/login` redireciona para `/` |
| **AES-256-GCM** | Cifra usada em `credentials.enc` |

↩ [[00-PAINEL-ESTUDOS|Painel de estudos]]
