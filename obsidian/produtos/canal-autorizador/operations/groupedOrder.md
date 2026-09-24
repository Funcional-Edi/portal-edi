---
generated: true
project: canal-autorizador
kind: query
name: groupedOrder
order: 3
---

# 3. Consultar um pedido

**Operação:** `query.groupedOrder` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Consulta, pelo id do pedido na Funcional, todos os dados do pedido: produtos, retorno, notas, cancelamentos e devoluções.

## Pré-requisitos

- [[produtos/canal-autorizador/operations/createGroupedOrder|createGroupedOrder]]

## Seções relacionadas

- [[produtos/canal-autorizador/sections/fluxo-do-pedido|fluxo-do-pedido]]

## Notas de negócio

- Use esta query para acompanhar todos os pedidos enviados pelo Canal Autorizador — é o principal método de acompanhamento do fluxo.
- O campo importation_outcome retorna null quando ainda não há resposta processada, e "importado com sucesso" quando já foi processado.
- Quando o pedido estiver com status PROCESSED, ele foi totalmente negado — não envie nenhuma requisição para este pedido; valide com o KAM/comercial da Funcional e, após o ajuste, envie um novo pedido (novo id).

## Exemplo GraphQL

```graphql
query groupedOrder {
  groupedOrder(id: 230408) {
    id
    grouped_order_code
    client_identification
    wholesaler
    client_code
    commercial_condition
    status
    created_at
    total_products
    products {
      ean
      ordered_quantity
      wholesaler_discount
      order_discount
      unit_net_price
      industry_order_code
      product_reason
      industry_abbreviation
      time_without_response
    }
    responses {
      status
      processed_at
      order_motive
      total_value
      discount_value
      products {
        ean
        response_quantity
        percent_discount
        unit_discount_price
        wholesaler_reason
        unit_net_price
        product_status
        product_reason
        monitored
        importation_outcome
      }
    }
    invoices {
      processed_at
      status
      issue_date
      number
      danfe
      value
      discount_value
      products_total_value
      products {
        product_status
        ean
        invoice_quantity
        percent_discount
        reimbursement_value
        importation_outcome
        invoice_item_id
        batches {
          quantity
          identification
          due_date
        }
      }
    }
    grouped_devolutions {
      invoice_number_devolution
      invoice_devolution_created_at
      cfop
      danfe
      status
      products {
        batch
        code_reason
        ean
        id
        importation_outcome
        quantity
        status
      }
    }
    cancellations {
      status
      products {
        ean
        status
        importation_outcome
        product_status
      }
    }
  }
}
```

---
↩ [[produtos/canal-autorizador/_index|Voltar ao manual canal-autorizador]]
