---
generated: true
project: canal-autorizador
kind: query
name: groupedInvoices
order: 7
---

# 7. Consultar o ressarcimento

**Operação:** `query.groupedInvoices` · **Projeto:** [[produtos/canal-autorizador/_index|canal-autorizador]]

Consulta os dados de ressarcimento das notas fiscais enviadas, incluindo boletos bancários e taxas de imposto.

## Pré-requisitos

- [[produtos/canal-autorizador/operations/createGroupedInvoice|createGroupedInvoice]]

## Exemplo GraphQL

```graphql
query {
  groupedInvoices(
    grouped_order_id: 587
    invoice_number: 351523
    wholesaler_branch_code: "00000000000000"
  ) {
    processed_at
    issue_date
    number
    base_calculation_icms_tax_substitution
    base_calculation_icms
    danfe
    value
    discount_value
    icms_value_transferred
    products_total_value
    status
    icms_total_value_withheld
    icms_total_value
    volume_quantity
    products {
      ean
      reimbursement_value
    }
  }
}
```

---
↩ [[produtos/canal-autorizador/_index|Voltar ao manual canal-autorizador]]
