# Cofre Obsidian — Portal EDI

## Abrir no Obsidian (primeira vez)

1. No Obsidian, clique em **Abrir pasta como um cofre** (não "Criar").
2. Selecione esta pasta: `Portal-Edi/obsidian`.
3. Abra a nota **[[00-MAPA-PORTAL]]** — é o hub de navegação.

## Atualização automática

No terminal, na raiz do projeto:

```bash
npm run obsidian:watch
```

Deixe rodando enquanto trabalha no Cursor. Quando `content/` ou `docs/` mudar, o cofre re-sincroniza.

Sync manual (uma vez):

```bash
npm run obsidian:sync
```

## O que atualiza sozinho

| Origem (Git) | No Obsidian |
| --- | --- |
| `docs/**/*.md` | `docs/` (atalho para a pasta real) |
| `content/projects/*/sections/*.md` | `produtos/{slug}/sections/` |
| `manual.json` + `config.json` | `produtos/{slug}/_index.md` e `operations/*.md` |

## Painel de estudos

`notas/estudos/00-PAINEL-ESTUDOS.md` — consulta rápida de comandos, fluxos de Git,
cronograma de estudos e glossário. É mantido pelo agente do Cursor (regra
`.cursor/rules/painel-estudos.mdc`), não pelo `obsidian:sync`.

Para forçar uma atualização, peça no chat: _"atualize o painel de estudos com o que fizemos hoje"_.

## Onde editar

| Conteúdo | Edite em | Publicado no portal |
| --- | --- | --- |
| Texto das seções | `content/projects/.../sections/` ou Obsidian | Sim |
| Roteiro GraphQL | Admin `/admin/projects/.../edit` ou `manual.json` | Sim |
| Mapas internos, ADRs | `docs/` ou Obsidian | Não (interno) |
| Anotações pessoais | `obsidian/notas/` | Não |

## Plugin opcional: Obsidian Git

Para backup automático no GitHub:

1. Obsidian → **Configurações** → **Plugins da comunidade** → ativar.
2. Instalar **Obsidian Git**.
3. Intervalo sugerido: commit a cada 30 min (só para `notas/` e ajustes seus).

Arquivos gerados (`operations/`, `_index.md`, `00-MAPA-PORTAL.md`) já estão no repo via `obsidian:sync`.
