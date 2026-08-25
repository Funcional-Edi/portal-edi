# Painel de Estudos — Portal EDI

Consulta rápida do dia a dia. Aprender **implementando** neste projeto.

## Preciso agora (top 6)

| Quero… | Comando | Onde roda |
| --- | --- | --- |
| Subir o portal | `npm run dev` | raiz do projeto → http://localhost:3002 |
| Sincronizar Obsidian | `npm run obsidian:watch` | terminal separado |
| Ver se quebrei algo | `npm run ci` | antes de commitar |
| Ver o que mudei | `git status` | qualquer hora |
| Salvar meu trabalho | `git add .` → `git commit -m "..."` → `git push` | ver [[comandos-git\|Git]] |
| Trocar de tarefa | `git switch nome-da-branch` | ver [[fluxo-branches\|Branches]] |

> **Este projeto não tem back e front separados.** É **Next.js**: um só comando (`npm run dev`) sobe as páginas e as APIs juntas. Detalhe em [[comandos-projeto#Por que só um comando]].

## Fichas de comando

- [[comandos-projeto|Comandos do projeto]] — dev, build, testes, Obsidian
- [[comandos-git|Git]] — do zero ao Pull Request
- [[comandos-terminal-windows|Terminal Windows / PowerShell]] — pegadinhas
- [[comandos-npm-node|npm e Node]] — dependências e versões

## Fluxos passo a passo

- [[fluxo-nova-feature|Implementar uma feature nova]]
- [[fluxo-branches|Trabalhar em várias tarefas sem se atrapalhar]]
- [[fluxo-projeto-do-zero|Começar um projeto do zero]]
- [[fluxo-novo-modulo|Criar um módulo novo neste projeto]]
- [[fluxo-quando-quebra|Quando algo quebra — como investigar]]

## Painel do projeto (HTML, fora do Obsidian)

Mapa geral + segurança + Kanban de prioridades + progresso das trilhas, tudo numa
tela só: `docs/painel/index.html` — abra direto no navegador (duplo-clique).
Kanban e checkboxes de estudo salvam no `localStorage` do navegador (não sincroniza
via Git nem com este cofre).

## UI / casca do portal

- Decisão: `docs/arquitetura/adr/0010-ui-shell-compartilhado.md` (via `obsidian/docs/…`)
- Checklist e diagnóstico: `docs/migracao/decisoes-ui.md`
- Código: `core/ui/` (`AppShell`, `Badge`, `SessionActions`)

## Estudo

- [[cronograma-estudos|Cronograma de estudos]] — o que aprender em cada fase
- [[glossario|Glossário]] — termos que aparecem no projeto
- [[diario|Diário de aprendizado]] — o que aprendi em cada dia

## Como manter isto vivo

Estas notas são **atualizadas pelo agente do Cursor** conforme aprendemos coisas novas
(regra `.cursor/rules/painel-estudos.mdc`). Se quiser forçar, peça:

> "atualize o painel de estudos com o que fizemos hoje"

↩ [[00-MAPA-PORTAL|Mapa do portal]]
