# Comandos do projeto — Portal EDI

Todos rodam na **raiz** do projeto: `C:\Projetos Cursor\Portal-Edi`

## Rodar o portal

| Comando         | Para que serve                                                                      |
| --------------- | ----------------------------------------------------------------------------------- |
| `npm run dev`   | Sobe o portal em modo desenvolvimento (recarrega ao salvar) → http://localhost:3002 |
| `npm run build` | Gera a versão otimizada de produção (checa tipos e compila tudo)                    |
| `npm run start` | Roda a versão de produção já buildada, na porta 3002                                |

Parar o servidor: `Ctrl + C` no terminal.

> **Um `dev` por pasta.** Na mesma cópia do projeto só pode haver **um**
> `npm run dev` (e não rode `npm run ci`/`build` com o dev aberto — disputa a
> pasta `.next/`). Detalhe em [[fluxo-quando-quebra#npm run ci / build estranho]].

## Por que só um comando

Em muitos projetos você sobe **backend** e **frontend** separados (dois terminais).
Aqui não: o **Next.js** é *fullstack*.

| Parte | Onde vive | Como aparece |
| --- | --- | --- |
| Telas (frontend) | `app/manual/`, `app/admin/` | páginas React |
| APIs (backend) | `app/api/.../route.ts` | endpoints HTTP |

Os dois são servidos pelo **mesmo** processo do `npm run dev`. É o padrão *BFF*
(Backend For Frontend): o backend existe para servir esse frontend.

## Qualidade (antes de commitar)

| Comando | O que garante |
| --- | --- |
| `npm run ci` | **Tudo**: typecheck → lint → arch → test → build |
| `npm run typecheck` | Nenhum erro de tipo TypeScript |
| `npm run lint` | Código no padrão (ESLint) |
| `npm run arch` | Regra `app → modules → core` não foi violada |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:watch` | Testes rodando e re-executando ao salvar |
| `npm run test:coverage` | Quanto do código está coberto por teste |
| `npm run test:e2e` | Testes de ponta a ponta no navegador (Playwright) |
| `npm run smoke:homolog` | Checks automatizados pré-deploy homolog (env, IM, módulos) |

Regra prática: **`npm run ci` verde antes de qualquer commit.**

## Obsidian (cofre de documentação)

| Comando | Para que serve |
| --- | --- |
| `npm run obsidian:sync` | Atualiza o cofre uma vez |
| `npm run obsidian:watch` | Fica observando `content/` e `docs/` e atualiza sozinho |

Deixe o `watch` num terminal separado enquanto trabalha.

## Primeira vez na máquina

```powershell
git clone https://github.com/Funcional-Edi/portal-edi.git
cd portal-edi
npm install
Copy-Item .env.example .env.local
Copy-Item data/permissions.example.json data/permissions.json
npm run dev
```

Depois preencha `AUTH_SECRET` no `.env.local` (sem ele o login não funciona).
Para logar sem SSO em local: `DEV_AUTH_ENABLED=true`.

## Rotas úteis

| URL | O que é |
| --- | --- |
| http://localhost:3002 | Home — login inline ou hub por papel |
| http://localhost:3002/manual | Catálogo de manuais (visão do distribuidor) |
| http://localhost:3002/interno | Guias internos EDI (admin) |
| http://localhost:3002/admin/projects | Admin — criar/editar manuais |
| http://localhost:3002/admin/metrics | Métricas do playground |
| http://localhost:3002/api/health | Healthcheck — módulos, CMS, RBAC |

## Terminais que costumo deixar abertos

| Terminal | Comando |
| --- | --- |
| 1 | `npm run dev` |
| 2 | `npm run obsidian:watch` |
| 3 | livre para `git`, `npm run ci`, etc. |

↩ [[00-PAINEL-ESTUDOS|Painel de estudos]]
