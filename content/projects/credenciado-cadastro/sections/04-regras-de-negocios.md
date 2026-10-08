# Regras de Negócios

- `Pharma_assessEligibility` determina elegibilidade e retorna a `registrationPolicy` aplicável.
- `requiresBeneficiaryRegistration=true` indica necessidade de inscrição; `false` indica beneficiário já cadastrado.
- A interface deve respeitar `HIDDEN`, `OPTIONAL` e `REQUIRED`; campos e opções variam conforme programa e produto.
- A inscrição de dependente só ocorre se o titular já estiver registrado, o produto exigir cadastro e o programa trabalhar com pacientes e permitir dependentes.
- Preserve o `programCode` retornado na avaliação nas operações seguintes.

> **OBSERVAÇÃO:** Os grupos de campos dinâmicos incluem `beneficiaryFields`, `dependentFields`, `medicalPrescriptionFields`, `extraFields` e `extraFormFields`; não os transforme em um formulário fixo para todos os programas.

> **ATENÇÃO:** Respeite `allowDependents` e `dependentsLimit` retornados pela API antes de permitir inclusão de dependentes.
