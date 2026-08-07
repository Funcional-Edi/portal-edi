# Git — do zero ao Pull Request

Repositório deste projeto: `https://github.com/Funcional-Edi/portal-edi.git`

## Modelo mental

Git tem **4 lugares**. Todo comando move arquivo de um para outro.

```text
1. Working directory  → arquivos que você editou
        ↓ git add
2. Staging (index)    → o que vai entrar no próximo commit
        ↓ git commit
3. Repositório local  → histórico na sua máquina
        ↓ git push
4. Remoto (GitHub)    → histórico compartilhado
```

Entender isso resolve 90% da confusão com Git.

## O ciclo do dia a dia

| Passo | Comando | Para que serve |
| --- | --- | --- |
| 1 | `git status` | Ver o que mudou e em que estágio está |
| 2 | `git diff` | Ver **linha por linha** o que mudou (ainda não em staging) |
| 3 | `git add .` | Colocar **tudo** em staging |
| 3b | `git add caminho/arquivo.ts` | Colocar **só um arquivo** em staging |
| 4 | `git commit -m "mensagem"` | Salvar um ponto no histórico local |
| 5 | `git push` | Enviar os commits para o GitHub |

```powershell
git status
git add .
git commit -m "feat: adiciona painel de estudos no Obsidian"
git push
```

## Verificar antes de commitar

```powershell
npm run ci
git status
git diff --staged   # revisa exatamente o que vai no commit
```

`--staged` (ou `--cached`) mostra o que já está em staging — útil para não commitar lixo.

## Mensagem de commit

Padrão **Conventional Commits** — o prefixo diz a natureza da mudança:

| Prefixo | Quando usar |
| --- | --- |
| `feat:` | Funcionalidade nova |
| `fix:` | Correção de bug |
| `refactor:` | Reorganiza código sem mudar comportamento |
| `docs:` | Só documentação |
| `test:` | Só testes |
| `chore:` | Configuração, dependências, scripts |

Exemplo bom: `feat(living-docs): permite reordenar operações no editor`
Exemplo ruim: `ajustes`

## Branches

Ver a nota dedicada: [[fluxo-branches|Trabalhar em várias tarefas sem se atrapalhar]]

Resumo:

| Comando | Para que serve |
| --- | --- |
| `git branch` | Lista branches locais (`*` = onde você está) |
| `git switch -c fase-7-fluxogramas` | Cria e entra numa branch nova |
| `git switch main` | Volta para a `main` |
| `git push -u origin fase-7-fluxogramas` | Envia a branch nova (primeira vez) |

## Pull Request (PR)

**O que é:** pedido para juntar sua branch na `main`, com espaço para revisão.

Pelo site: GitHub mostra o botão "Compare & pull request" após o push.

Pelo terminal (precisa do GitHub CLI `gh`):

```powershell
gh pr create --title "Fase 7 — fluxogramas" --body "Implementa modulo de fluxogramas"
gh pr status      # ver situacao dos seus PRs
gh pr checks      # ver se o CI passou
```

## Trazer mudanças de outros

| Comando | Para que serve |
| --- | --- |
| `git fetch` | Baixa novidades do GitHub **sem** mexer nos seus arquivos |
| `git pull` | Baixa **e** aplica na sua branch atual |
| `git pull origin main` | Traz o que mudou na `main` para a branch atual |

Ordem segura: `git status` (limpo?) → `git pull` → resolver conflito se houver.

## Desfazer (com cuidado)

| Situação | Comando | Efeito |
| --- | --- | --- |
| Desfazer edição de um arquivo não commitado | `git restore arquivo.ts` | Volta ao último commit — **perde a edição** |
| Tirar de staging, manter a edição | `git restore --staged arquivo.ts` | Sai do staging, arquivo continua alterado |
| Corrigir a mensagem do último commit | `git commit --amend -m "nova msg"` | Só se **não** tiver dado push |
| Desfazer último commit, manter o código | `git reset --soft HEAD~1` | Commit volta para staging |
| Guardar tudo temporariamente | `git stash` | Ver [[fluxo-branches#Guardar trabalho pela metade (stash)]] |

**Nunca** use `git reset --hard` sem entender: apaga alterações sem volta.

## Investigar histórico

| Comando | Para que serve |
| --- | --- |
| `git log --oneline` | Histórico compacto (um commit por linha) |
| `git log --oneline -10` | Últimos 10 commits |
| `git log --oneline --graph --all` | Desenha o grafo de branches |
| `git show 4b04689` | Vê tudo que um commit específico mudou |
| `git blame arquivo.ts` | Quem mudou cada linha e em qual commit |

## Erros comuns

| Erro | Causa | Solução |
| --- | --- | --- |
| `fatal: not a git repository` | Você não está na pasta do projeto | `cd "C:\Projetos Cursor\Portal-Edi"` |
| `rejected — non-fast-forward` | O remoto tem commits que você não tem | `git pull` e resolver, depois `git push` |
| `no upstream branch` | Branch nova nunca enviada | `git push -u origin nome-da-branch` |
| Commitou `.env.local` | Segredo no histórico | Avise o time — precisa remover do histórico |

↩ [[00-PAINEL-ESTUDOS|Painel de estudos]]
