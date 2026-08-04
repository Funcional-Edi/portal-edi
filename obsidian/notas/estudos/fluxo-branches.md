# Trabalhar em várias tarefas sem se atrapalhar

**Problema:** estou na Fase 7 e aparece um bug urgente na `main`. Como mexer numa
coisa sem afetar a outra?

**Resposta:** branches. Cada branch é uma linha do tempo independente.

## O que é uma branch

Um "ponteiro" para uma sequência de commits. Trocar de branch **troca os arquivos
da sua pasta** para o estado daquela linha do tempo.

```text
main            A───B───C
                     \
fase-7-fluxogramas    D───E     ← você trabalha aqui
```

Branches deste repositório hoje: `main`, `fase-3-admin`, `fase-manual`.

## Criar uma branch e trabalhar nela

```powershell
git switch main            # parte sempre de uma base limpa
git pull                   # atualiza a main
git switch -c fase-7-fluxogramas
```

`switch -c` = *create*: cria a branch **e** entra nela.

Depois de trabalhar:

```powershell
npm run ci
git add .
git commit -m "feat(fluxogramas): estrutura inicial do modulo"
git push -u origin fase-7-fluxogramas
```

O `-u` (upstream) só é necessário no **primeiro** push da branch. Depois, só `git push`.

## Sair de uma branch para outra

**Regra de ouro:** só troque de branch com o `git status` **limpo**.

```powershell
git status                 # "nothing to commit, working tree clean"?
git switch main            # agora sim
```

Se tiver alteração pendente, escolha uma das três:

| Situação | O que fazer |
| --- | --- |
| Trabalho pronto | `git add .` + `git commit -m "..."` |
| Trabalho pela metade, volto logo | `git stash` (ver abaixo) |
| Trabalho é lixo | `git restore .` — apaga as alterações |

## Guardar trabalho pela metade (stash)

`git stash` = gaveta temporária. Guarda suas alterações e devolve a pasta limpa.

```powershell
git stash                  # guarda tudo
git switch main            # resolve a urgência
# ...corrige o bug, commita, push...
git switch fase-7-fluxogramas
git stash pop              # devolve o que estava guardado
```

| Comando | Para que serve |
| --- | --- |
| `git stash` | Guarda alterações e limpa a pasta |
| `git stash list` | Lista o que está guardado |
| `git stash pop` | Devolve o último e **remove** da gaveta |
| `git stash apply` | Devolve o último e **mantém** na gaveta |
| `git stash drop` | Descarta o último guardado |

## Bug urgente na main (fluxo completo)

```powershell
git stash                        # 1. guarda o que está fazendo
git switch main                  # 2. vai para a main
git pull                         # 3. atualiza
git switch -c fix/login-timeout  # 4. branch do hotfix
# ...corrige...
npm run ci                       # 5. valida
git add .
git commit -m "fix(auth): corrige timeout no login SSO"
git push -u origin fix/login-timeout
# 6. abre o PR no GitHub
git switch fase-7-fluxogramas    # 7. volta ao que estava
git stash pop                    # 8. recupera o trabalho
```

## Trazer a main atualizada para a sua branch

Sua branch está velha e a `main` andou:

```powershell
git switch fase-7-fluxogramas
git pull origin main       # traz os commits da main para cá
```

Se houver **conflito**, o Git marca os arquivos. No Cursor, abra o arquivo e escolha
qual versão fica; depois:

```powershell
git add .
git commit                 # finaliza a resolução do conflito
```

## Nomes de branch (convenção)

| Prefixo | Uso | Exemplo |
| --- | --- | --- |
| `feat/` | Funcionalidade | `feat/export-postman` |
| `fix/` | Correção | `fix/login-timeout` |
| `docs/` | Documentação | `docs/atualiza-mapa` |
| `fase-N-…` | Fases do cronograma | `fase-7-fluxogramas` |

## Depois que o PR foi aprovado e mergeado

```powershell
git switch main
git pull                              # traz o merge
git branch -d fase-7-fluxogramas      # apaga a branch local (já mergeada)
```

`-d` só apaga se estiver mergeada — é uma proteção. (`-D` força, evite.)

## Resumo em 6 comandos

```powershell
git switch main            # base
git pull                   # atualiza
git switch -c minha-branch # nova tarefa
git status                 # sempre confira antes de trocar
git stash                  # pausa sem perder
git switch outra-branch    # troca de contexto
```

↩ [[00-PAINEL-ESTUDOS|Painel de estudos]] · [[comandos-git|Git completo]]
