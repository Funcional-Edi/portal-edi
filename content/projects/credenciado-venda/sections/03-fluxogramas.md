# Fluxogramas

O subproduto possui dois fluxogramas complementares:

- **Fluxo de Venda — BF:** consulta do beneficiário, simulação, pré-autorização,
  eventual prescrição, consulta, confirmação, atualização fiscal e
  cancelamento.
- **Fluxo de Venda - PBM:** carga de programas, elegibilidade,
  subprocessos de Cadastro e Opt-in quando necessários, regra no balcão e o
  mesmo ciclo transacional da venda.

> **ATENÇÃO:** No fluxo BF, `requiredUploadWithPrescription` retornado por
> `Pharma_checkPricesAndRules` determina a necessidade de seguir o processo
> de receita. Quando o valor for `true`, a jornada executa
> `Prescription_uploadPrescription`, preserva os IDs retornados e realiza
> `Prescription_bindPrescription` antes de consultar e confirmar a venda.

No fluxo PBM, a pré-autorização segue diretamente para a consulta da transação,
sem o ramo de requerimento de receita.
