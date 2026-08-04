# npm e Node

**Node.js** = roda JavaScript/TypeScript fora do navegador.
**npm** = gerenciador de pacotes do Node (instala bibliotecas, roda scripts).

Este projeto exige **Node 20.x** (`engines` no `package.json`).

## Conferir a instalação

| Comando | Para que serve |
| --- | --- |
| `node -v` | Versão do Node (deve começar com `v20.`) |
| `npm -v` | Versão do npm |
| `npm ls --depth=0` | Lista as dependências diretas instaladas |

## Instalar dependências

| Comando | Para que serve |
| --- | --- |
| `npm install` | Instala tudo que está no `package.json` |
| `npm ci` | Instala **exatamente** o `package-lock.json` — usado no CI |
| `npm install nome-do-pacote` | Adiciona uma dependência de produção |
| `npm install -D nome-do-pacote` | Adiciona dependência só de desenvolvimento |
| `npm uninstall nome-do-pacote` | Remove |

Diferença que importa: `npm install` pode **atualizar** versões dentro do permitido;
`npm ci` apaga `node_modules` e instala travado no lock. Use `npm ci` quando quiser
reproduzir exatamente o ambiente do CI.

> Cuidado: `npm ci` (do npm) é diferente de `npm run ci` (script deste projeto, que
> roda typecheck/lint/arch/test/build). Nomes parecidos, coisas distintas.

## Rodar scripts

Scripts ficam em `package.json` → `"scripts"`.

```powershell
npm run dev          # roda o script "dev"
npm run              # lista todos os scripts disponíveis
```

Lista atual deste projeto em [[comandos-projeto|Comandos do projeto]].

## Prod vs. dev

| Bloco no `package.json` | O que é | Exemplo aqui |
| --- | --- | --- |
| `dependencies` | Precisa existir em produção | `next`, `react`, `zod` |
| `devDependencies` | Só para desenvolver/testar | `vitest`, `eslint`, `typescript` |

Colocar uma lib de teste em `dependencies` engorda o deploy sem necessidade.

## Versões (`^`, `~`, fixa)

| Notação | Aceita | Exemplo |
| --- | --- | --- |
| `^3.24.2` | Atualizações **menores** e patches (3.x.x) | `zod: ^3.24.2` |
| `~3.24.2` | Só patches (3.24.x) | — |
| `3.24.2` | Exatamente essa | `next: 15.5.21` |

`next` está fixo de propósito: mudança de versão do framework merece decisão
consciente (ver ADR-0008).

## Quando algo estranho acontece

Ordem de tentativa, do mais leve ao mais pesado:

```powershell
# 1. Cache do Next.js corrompido
Remove-Item -Recurse -Force .next

# 2. Dependências inconsistentes
Remove-Item -Recurse -Force node_modules
npm install

# 3. Reset total (lock incluso — só se souber o motivo)
Remove-Item -Recurse -Force node_modules, .next
npm ci
```

`node_modules/` e `.next/` são **gerados** — apagar não perde trabalho.

## Segurança e manutenção

| Comando | Para que serve |
| --- | --- |
| `npm outdated` | Mostra dependências desatualizadas |
| `npm audit` | Lista vulnerabilidades conhecidas |
| `npm audit fix` | Corrige o que consegue sem quebrar |

↩ [[00-PAINEL-ESTUDOS|Painel de estudos]]
