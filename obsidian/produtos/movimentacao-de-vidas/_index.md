---
generated: true
slug: movimentacao-de-vidas
published: true
---

# Integração — Movimentação de Vidas

| Campo | Valor |
| --- | --- |
| Slug | `movimentacao-de-vidas` |
| Produto | Gateway Companies |
| Versão manual | 1.0.0 |
| Ambiente | homolog |
| Publicado | sim |
| GraphQL | https://companies-uat.funcionalhealthtech.com.br/graphql |

Integração GraphQL para inclusão, atualização, transferência, ativação e desativação de beneficiários, com processamento assíncrono.

## Roteiro (operações)

1. [[produtos/movimentacao-de-vidas/operations/createToken|1. Criar token]]
2. [[produtos/movimentacao-de-vidas/operations/BRM_createOrUpdateBeneficiary|2. Enviar movimentação]]
3. [[produtos/movimentacao-de-vidas/operations/BRM_getProcessingStatus|3. Consultar status do processamento]]
4. [[produtos/movimentacao-de-vidas/operations/BRM_getBeneficiariesByIdentity|4. Consultar beneficiário]]

## Tabelas de referência

### Status do processamento

| Status | Orientação |
| --- | --- |
| WAITING | A instrução foi recebida e aguarda processamento. |
| PROCESSING | A instrução está sendo processada. |
| SUCCESS | A instrução foi processada com sucesso. |
| ERROR | O processamento terminou com erro; consulte a mensagem retornada. |

## Histórico de versão

- **1.0.0** (2026-09-23) — Time EDI: Documentação inicial do fluxo de movimentação de beneficiários.

## Seções (Markdown)

_Edite em `content/projects/movimentacao-de-vidas/sections/` — atualiza aqui automaticamente._

↩ [[00-MAPA-PORTAL|Mapa do portal]]
