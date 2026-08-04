# Terminal Windows / PowerShell

O terminal deste projeto é **PowerShell** (não bash/Linux). Vários comandos que você
vê em tutoriais não funcionam igual.

## Pegadinha nº 1 — encadear comandos

```powershell
# ❌ Falha nesta versão do PowerShell
git status && git log

# ✅ Use ponto e vírgula
git status; git log
```

`;` roda o segundo comando **sempre**. Se quiser rodar o segundo **só se o primeiro
der certo**, teste o código de saída:

```powershell
npm run ci; if ($?) { git push }
```

## Equivalências bash → PowerShell

| Bash (tutoriais) | PowerShell (aqui) | Para que serve |
| --- | --- | --- |
| `ls` | `ls` ou `Get-ChildItem` | Lista arquivos |
| `cat arquivo` | `Get-Content arquivo` | Mostra conteúdo |
| `cp a b` | `Copy-Item a b` | Copia |
| `mv a b` | `Move-Item a b` | Move/renomeia |
| `rm arquivo` | `Remove-Item arquivo` | Apaga |
| `mkdir pasta` | `mkdir pasta` | Cria pasta |
| `pwd` | `pwd` ou `Get-Location` | Onde estou |
| `export VAR=x` | `$env:VAR = "x"` | Variável de ambiente |
| `grep texto` | `Select-String texto` | Busca texto |
| `head -20` | `Select-Object -First 20` | Primeiras linhas |
| `tail -20` | `Select-Object -Last 20` | Últimas linhas |
| `touch a.txt` | `New-Item a.txt` | Cria arquivo vazio |

## Caminhos com espaço

O caminho deste projeto tem espaço (`Projetos Cursor`). **Sempre** use aspas:

```powershell
# ❌
cd C:\Projetos Cursor\Portal-Edi

# ✅
cd "C:\Projetos Cursor\Portal-Edi"
```

## Navegação

| Comando | Para que serve |
| --- | --- |
| `cd "C:\Projetos Cursor\Portal-Edi"` | Vai para a raiz do projeto |
| `cd ..` | Sobe um nível |
| `cd modules\living-docs-externa` | Entra numa subpasta |
| `ls` | Lista o conteúdo da pasta atual |
| `ls -Recurse -Filter *.test.ts` | Busca arquivos por padrão, recursivo |

## Processos e portas

Porta ocupada é o erro mais comum ao subir o dev server.

```powershell
# Quem está usando a porta 3002?
Get-NetTCPConnection -LocalPort 3002 | Select-Object OwningProcess

# Ver o processo
Get-Process -Id <numero-do-processo>

# Encerrar
Stop-Process -Id <numero-do-processo>
```

Alternativa rápida: encerrar todos os Node parados.

```powershell
Get-Process node | Stop-Process
```

Cuidado: isso mata **todos** os processos Node, inclusive o `obsidian:watch`.

## Atalhos no terminal

| Atalho | O que faz |
| --- | --- |
| `Ctrl + C` | Interrompe o comando em execução (para o dev server) |
| `↑` / `↓` | Navega no histórico de comandos |
| `Tab` | Autocompleta caminho ou comando |
| `Ctrl + L` | Limpa a tela |
| `clear` | Limpa a tela |

## Terminal dentro do Cursor

| Atalho | O que faz |
| --- | --- |
| `` Ctrl + ` `` | Abre/fecha o painel de terminal |
| `Ctrl + Shift + 5` | Divide o terminal em dois painéis |
| `Ctrl + Shift + \`` | Abre um terminal novo (aba) |

Útil para deixar `npm run dev` e `npm run obsidian:watch` lado a lado.

↩ [[00-PAINEL-ESTUDOS|Painel de estudos]]
