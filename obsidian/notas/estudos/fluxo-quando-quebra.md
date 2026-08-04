# Quando algo quebra — como investigar

Método: **ler o erro → isolar a camada → reproduzir → corrigir → provar com teste.**

Não chute. Ler a mensagem inteira resolve a maioria dos casos.

## `npm run ci` falhou — qual etapa?

O `ci` roda em ordem e **para na primeira falha**. A etapa que falhou já diz o tipo do
problema:

| Falhou em | Significa | Onde olhar |
| --- | --- | --- |
| `typecheck` | Tipo errado ou faltando | O arquivo e a linha no erro do `tsc` |
| `lint` | Padrão de código | `npm run lint` mostra regra e linha |
| `arch` | **Violou a arquitetura** | Import proibido — ver [[fluxo-novo-modulo#As 3 regras que mais quebram o CI]] |
| `test` | Comportamento mudou | Nome do teste que falhou |
| `build` | Erro só em produção | Server/client component, env faltando |

Rode a etapa isolada para iterar rápido:

```powershell
npm run typecheck
npm run arch
npm run test
```

## Erros de tipo (TypeScript)

Leia de **baixo para cima**: a última linha geralmente tem a causa raiz.

| Mensagem | Causa comum | Correção |
| --- | --- | --- |
| `Property 'x' does not exist on type` | Campo não existe no tipo | Adicione no schema Zod ou corrija o nome |
| `Type 'undefined' is not assignable` | Valor pode ser nulo | Trate o caso: `if (!x) return` ou `x ?? padrão` |
| `Cannot find module '@/...'` | Caminho errado ou arquivo inexistente | Confira o path e o `tsconfig.json` |

## Testes falhando

```powershell
npm run test:watch                       # re-roda ao salvar
npx vitest run --config config/vitest.config.ts caminho/do/arquivo.test.ts
```

Leia o diff `expected` vs. `received` do Vitest. Duas possibilidades:

1. O **código** está errado → corrija o código
2. O **comportamento mudou de propósito** → atualize o teste (e explique no commit)

Nunca "conserte" apagando a assertion.

## Servidor não sobe

| Sintoma | Causa | Solução |
| --- | --- | --- |
| `Port 3002 is already in use` | Já tem um dev server rodando | Ver [[comandos-terminal-windows#Processos e portas]] |
| `Module not found` | Dependência não instalada | `npm install` |
| Erro em `core/config` | Variável de ambiente faltando | Preencher `.env.local` (`AUTH_SECRET`) |
| Comportamento antigo persistindo | Cache do Next | `Remove-Item -Recurse -Force .next` |

## Erros de Next.js (App Router)

| Mensagem | Causa | Correção |
| --- | --- | --- |
| `You're importing a component that needs useState...` | Componente interativo sem `"use client"` | Adicione `"use client"` na primeira linha |
| `Hydration failed` | HTML do servidor ≠ do cliente | Evite `Date.now()`/`Math.random()` no render |
| `Dynamic server usage` | Rota estática usando `cookies()`/`headers()` | Marque a rota como dinâmica |

## Login não funciona em local

1. `AUTH_SECRET` preenchido no `.env.local`?
2. `DEV_AUTH_ENABLED=true` (só em `NODE_ENV=development`)?
3. Bateu no limite? São **10 tentativas / 15 min** (ADR-0007) — espere ou reinicie o server.

## Git travado

| Sintoma | Solução |
| --- | --- |
| Não consigo trocar de branch | `git stash` — ver [[fluxo-branches#Guardar trabalho pela metade (stash)]] |
| `push` rejeitado | `git pull` e resolver, depois `git push` |
| Conflito de merge | Abra o arquivo, escolha a versão, `git add .`, `git commit` |
| Commitei algo errado (sem push) | `git reset --soft HEAD~1` |

## Obsidian não atualiza

1. O `npm run obsidian:watch` está rodando?
2. Se não: `npm run obsidian:sync` atualiza de uma vez
3. Nota gerada com conteúdo errado? Corrija a **origem** (`content/`, `docs/`), não a nota

## Quando pedir ajuda ao agente

Traga estas 4 coisas — respostas ficam muito melhores:

1. O comando que rodou
2. A mensagem de erro **completa** (não resumida)
3. O que você esperava que acontecesse
4. O que já tentou

↩ [[00-PAINEL-ESTUDOS|Painel de estudos]]
