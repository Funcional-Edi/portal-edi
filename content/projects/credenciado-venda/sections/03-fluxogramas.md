# Fluxogramas

O subproduto possui dois fluxogramas complementares:

- **Fluxo de Venda — BF:** consulta do beneficiário, simulação, pré-autorização,
  eventual prescrição, consulta, confirmação, atualização fiscal e
  cancelamento.
- **Fluxo de Venda — PBM no Caixa:** carga de programas, elegibilidade,
  subprocessos de Cadastro e Opt-in quando necessários, regra no balcão e o
  mesmo ciclo transacional da venda.

Nos dois caminhos, `requiredUploadWithPrescription` retornado por
`Pharma_checkPricesAndRules` determina a obrigatoriedade de receita. Quando o
valor for `true`, a jornada executa `Prescription_uploadPrescription`, preserva
os IDs retornados e realiza `Prescription_bindPrescription` antes de consultar
e confirmar a venda.

> **COMENTÁRIO:** O tratamento de erro operacional no upload ou vínculo da
> receita permanece pendente de validação técnica. As validações já definidas
> são tipo de arquivo permitido e limite de 2 MB.
