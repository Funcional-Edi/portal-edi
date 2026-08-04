---
generated: true
slug: im
published: true
---

# Integracao IM - Inventario

| Campo | Valor |
| --- | --- |
| Slug | `im` |
| Produto | Inventory Management |
| Versão manual | 1.3.0 |
| Ambiente | homolog |
| Publicado | sim |
| GraphQL | https://gateway-homologa.fidelize.com.br/graphql |

Manual de integracao de inventario para distribuidores (ambiente homolog).

## Roteiro (operações)

1. [[produtos/im/operations/createToken|1. Obter token do gateway]]
2. [[produtos/im/operations/saveInventories|2. Enviar carga de estoque]]

## Tabelas de referência

### operationType - modos de carga

| Valor | Uso |
| --- | --- |
| INSERT | Primeira carga do dia ou novos produtos |
| OVERLAP | Sobrescreve a carga da mesma data |
| DELETE | Remove produtos enviados da carga |

## Histórico de versão

- **1.3.0** (2026-08-20) — Time EDI: Ajuste de notas de negocio para janela de processamento.
- **1.2.0** (2026-07-28) — Time EDI: Migracao inicial para o Portal de Integracao.

## Seções (Markdown)

_Edite em `content/projects/im/sections/` — atualiza aqui automaticamente._

↩ [[00-MAPA-PORTAL|Mapa do portal]]
