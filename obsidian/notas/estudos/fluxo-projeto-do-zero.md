# Começar um projeto do zero

Sequência genérica, na ordem em que foi feita neste projeto. Serve de receita para o
próximo.

## 1. Pasta e Git

```powershell
mkdir meu-projeto
cd meu-projeto
git init
```

`git init` cria o repositório local (a pasta `.git`).

## 2. Scaffold do framework

```powershell
npx create-next-app@latest . --typescript --tailwind --app --eslint
```

`npx` roda um pacote **sem instalar** globalmente. Aqui usamos Next.js 15 com App
Router, TypeScript e Tailwind (decisão registrada em ADR-0008).

## 3. `.gitignore` antes do primeiro commit

Nunca versione: `node_modules/`, `.next/`, `.env.local`, `coverage/`.

**Por quê antes:** se um segredo entra no histórico, tirar dá trabalho.

## 4. Variáveis de ambiente

```powershell
Copy-Item .env.example .env.local
```

Padrão: `.env.example` **versionado** (só nomes das variáveis), `.env.local`
**ignorado** (valores reais).

## 5. Decidir a estrutura — e escrever a decisão

Neste projeto: `app → modules → core`, registrada em ADR-0001.

Formato **ADR** (Architecture Decision Record) — um arquivo por decisão:

```markdown
# ADR-0001: Título da decisão
- Status: Aceita
- Data: 2026-07-28

## Contexto     (qual problema)
## Decisão      (o que escolhemos)
## Consequências (o que fica fácil / difícil / quando revisar)
```

Template pronto: `docs/arquitetura/adr/_template.md`.

**Por quê:** em 6 meses ninguém lembra *por que* algo foi feito assim. O ADR responde
sem precisar arqueologia no Git.

## 6. Ferramentas de qualidade (dia 1, não depois)

| Ferramenta | Para que serve | Script |
| --- | --- | --- |
| TypeScript | Erros de tipo antes de rodar | `npm run typecheck` |
| ESLint | Padrão de código | `npm run lint` |
| Vitest | Testes unitários | `npm run test` |
| dependency-cruiser | Impede violar a arquitetura | `npm run arch` |
| Playwright | Testes no navegador | `npm run test:e2e` |

E um script que roda tudo:

```json
"ci": "npm run typecheck && npm run lint && npm run arch && npm run test && npm run build"
```

**Por quê no dia 1:** qualidade adicionada depois encontra 500 erros de uma vez e
ninguém arruma.

## 7. Fundação antes de features

Ordem usada aqui:

```text
core/config   → validação de env (falha rápido se faltar variável)
core/errors   → erros tipados
core/auth     → login e permissões
core/db       → adaptadores de persistência
core/events   → comunicação entre módulos
core/ai       → camada de IA com guardrails e custo
--- só então ---
modules/<primeiro contexto>
```

## 8. Primeiro commit e remoto

```powershell
git add .
git commit -m "chore: estrutura inicial do projeto"
git branch -M main
git remote add origin https://github.com/org/repo.git
git push -u origin main
```

| Comando | Para que serve |
| --- | --- |
| `git branch -M main` | Renomeia a branch atual para `main` |
| `git remote add origin URL` | Aponta para o repositório no GitHub |
| `git push -u origin main` | Primeiro envio, gravando o vínculo |

## 9. README que responde 3 perguntas

1. **O que é** o projeto
2. **Como rodar** (comandos exatos)
3. **Onde estão as decisões** (link para `docs/`)

## Ordem resumida

```text
git init → scaffold → .gitignore → .env → decisões (ADR)
→ ferramentas de qualidade → fundação (core) → primeiro módulo
→ commit → remoto → README
```

↩ [[00-PAINEL-ESTUDOS|Painel de estudos]]
