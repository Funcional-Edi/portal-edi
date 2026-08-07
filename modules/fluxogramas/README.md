# `fluxogramas` — Diagramas de integração (BPMN)

Fluxos de integração curados por produto, vinculados ao manual em `content/projects/{slug}/`.

## Estrutura

```
schema/       # Zod: IntegrationFlow, refs mínimos de projeto/manual
repository/   # I/O CMS — flow.json por slug
services/     # get/save, validação, export Mermaid
ui/           # catálogo, viewer (distribuidor), editor (admin)
```

## Modelo de dados (ADR-0009)

```
content/projects/{slug}/
  flow.json     # IntegrationFlow (nós tipados + arestas)
```

Nós MVP: `start`, `operation` (opcional `operationRef` → `manual.json`), `decision`, `end`.

Sem banco — capability `content` apenas.

## Rotas

| Rota | Quem | UI |
|------|------|-----|
| `/fluxogramas` | logado (`access: any`) | Catálogo de fluxos publicados |
| `/fluxogramas/[slug]` | viewer React Flow (somente leitura) |
| `/admin/projects/[slug]/flow` | admin | Editor canvas |

## APIs BFF

| Método | Rota | Service |
|--------|------|---------|
| GET | `/api/fluxogramas/[slug]` | `get-flow` |
| PUT | `/api/fluxogramas/[slug]` | `save-flow` |
| GET/POST | `/api/fluxogramas/[slug]/mermaid` | `exportFlowToMermaid` |

## Seeds

- `content/projects/demo/flow.json` — paridade com manual demo (2 ops)
- `content/projects/canal-autorizador/` — template com decisão (mapa §9)

## Integração living-docs

- Roteiro `/manual/[slug]` exibe link **Ver fluxograma** quando `flow.json` existe (wire na camada `app/`).
- Admin do projeto linka para `/admin/projects/[slug]/flow`.
