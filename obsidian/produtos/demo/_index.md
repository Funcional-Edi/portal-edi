---
generated: true
slug: demo
published: true
---

# Integração IM — Inventário (demo)

| Campo | Valor |
| --- | --- |
| Slug | `demo` |
| Produto | Inventory Management |
| Versão manual | 1.0.0-demo |
| Ambiente | homolog |
| Publicado | sim |
| GraphQL | https://gateway-homologa.fidelize.com.br/graphql |

Manual de demonstração com 2 operações (paridade simplificada com IM v1.0.0).

## Roteiro (operações)

1. [[produtos/demo/operations/createToken|1. Obter token]]
2. [[produtos/demo/operations/saveInventories|2. Enviar carga de estoque]]

## Tabelas de referência

### operationType — modos de carga

| Valor | Uso |
| --- | --- |
| INSERT | Primeira carga do dia ou novos produtos |
| OVERLAP | Sobrescreve carga existente na mesma data |
| DELETE | Remove produtos informados da carga |

## Seções (Markdown)

_Edite em `content/projects/demo/sections/` — atualiza aqui automaticamente._

↩ [[00-MAPA-PORTAL|Mapa do portal]]
