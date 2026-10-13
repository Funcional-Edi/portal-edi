# Protocolo de fluxogramas Credenciado: Cadastro, Opt-in e Venda BF/PBM

> **Status:** base aprovada para construção dos fluxogramas. Este material
> registra a regra de negócio e a organização no Portal EDI; ele não substitui
> a validação técnica dos caminhos de falha nem os diagramas visuais.

## Objetivo e fonte

Este protocolo organiza os quatro fluxos que compõem a jornada de venda do
Credenciado:

1. Cadastro;
2. Opt-in;
3. Venda BF e PBM;
4. Venda PBM no Caixa.

As fontes são o fluxograma BF revisado, o fluxo PBM no Caixa fornecido para a
revisão e os manuais curados no repositório. Quando uma fonte divergir do
manual, o diagrama não deve inventar uma operação: a divergência fica marcada
para validação técnica.

## Organização no Portal EDI

Cadastro e Opt-in continuam como subprodutos próprios, cada um com seu
fluxograma. No PBM, eles são chamados como subprocessos, sem duplicar suas
etapas dentro do desenho de venda.

O subproduto `credenciado-venda` passa a ser a referência visual dos dois
fluxos de venda. Quando os diagramas forem criados, seu `flow.json` deverá usar
o documento de múltiplos fluxos com estas entradas:

| ID | Título | Escopo |
|---|---|---|
| `venda-bf` | Fluxo de Venda — BF | Benefício Farmácia, do token ao encerramento da venda. |
| `venda-pbm` | Fluxo de Venda — PBM  | Elegibilidade, Cadastro/Opt-in quando aplicáveis e ciclo de venda PBM. |

O projeto `credenciado-pbm-caixa` permanece como referência documental do PBM
até a consolidação visual. Não criar uma segunda cópia visual do mesmo PBM sem
definir a migração ou o link de referência.

## Convenções de diagrama

Para os dois fluxos de venda:

- usar uma única raia, identificada lateralmente pelo nome do fluxo;
- evento inicial em círculo verde e evento final em círculo vermelho;
- decisões em losangos, com ramos `Sim` e `Não` legíveis e sem sobreposição;
- Cadastro e Opt-in em blocos de subprocesso no PBM;
- operações com `operationRef` somente quando existirem no manual curado;
- aplicar integralmente `content/interno/guides/padrao-fluxogramas.md` na
  montagem e na revisão visual.

## Componentes reutilizados

### Fluxo de Cadastro

O Cadastro é chamado pelo PBM quando a avaliação indicar que o paciente não
está cadastrado. O retorno do subprocesso segue para a verificação de Opt-in.
O desenho interno do Cadastro permanece no subproduto `credenciado-cadastro`.

### Fluxo de Opt-in

O Opt-in é chamado pelo PBM somente quando a verificação indicar que ele é
obrigatório e que o paciente ainda não deu o aceite. Após a conclusão, o fluxo
retorna para a exibição da regra no balcão. O desenho interno do Opt-in
permanece no subproduto `credenciado-optin`.

## Fluxo de Venda — BF

### Sequência principal

```text
createToken (uma vez ao dia)
  → início
  → Sales_customerMemberships
  → Pharma_checkPricesAndRules
  → Sales_preAuthorizeSale
  → receita exige anexo?
      ├─ Não → Sales_transaction
      └─ Sim → subfluxo de prescrição → Sales_transaction
  → Sales_confirmPreAuthorizedSale
  → dados da NF-e já foram enviados?
      ├─ Sim → venda será cancelada?
      └─ Não → Sales_updateInvoiceCode → venda será cancelada?
  → se Sim: Sales_cancel
  → fim
```

### Regra específica BF

Antes da simulação, consultar o beneficiário com
`Sales_customerMemberships`. A simulação acontece depois dessa consulta. Os
identificadores e itens autorizados retornados na pré-autorização devem ser
preservados até a confirmação, a atualização fiscal ou o cancelamento.

## Fluxo de Venda — PBM no Caixa

### Preparação diária

```text
createToken (uma vez ao dia)
  → Pharma_discountPrograms (uma vez ao dia)
  → Pharma_displayProductDiscountRules (uma vez ao dia no e-commerce)
  → início
```

### Elegibilidade, Cadastro e Opt-in

```text
Pharma_assessEligibility
  → paciente está cadastrado?
      ├─ Não → subprocesso Fluxo de Cadastro → Pharma_verifyOptIn
      └─ Sim → Pharma_verifyOptIn
  → Opt-in é obrigatório?
      ├─ Não → Pharma_displayProduct
      └─ Sim → paciente já deu o aceite?
          ├─ Sim → Pharma_displayProduct
          └─ Não → subprocesso Fluxo de Opt-in → Pharma_displayProduct
```

### Continuação da venda

```text
Pharma_displayProduct
  → Pharma_checkPricesAndRules
  → Sales_preAuthorizeSale
  → receita exige anexo?
      ├─ Não → Sales_transaction
      └─ Sim → subfluxo de prescrição → Sales_transaction
  → Sales_confirmPreAuthorizedSale
  → dados da NF-e já foram enviados?
      ├─ Sim → venda será cancelada?
      └─ Não → Sales_updateInvoiceCode → venda será cancelada?
  → se Sim: Sales_cancel
  → fim
```

O material de origem do PBM cita `Pharma_preAuthorizeSale`, mas os manuais
curados de PBM e Venda registram `Sales_preAuthorizeSale`. O diagrama deve usar
`Sales_preAuthorizeSale`; não criar uma operação `Pharma_preAuthorizeSale` sem
contrato técnico publicado.

## Subfluxo compartilhado: prescrição

O subfluxo vale para BF e PBM. A decisão é determinada por
`requiredUploadWithPrescription`, retornado por
`Pharma_checkPricesAndRules`: quando o valor for `true`, a regra de negócio do
fornecedor exige a receita e o upload é obrigatório. Quando o valor for
`false`, não há upload nem vínculo. A pré-autorização continua antes do
vínculo, pois fornece os identificadores da transação.

```text
requiredUploadWithPrescription = true
  → Prescription_uploadPrescription
  → Prescription_bindPrescription
  → Sales_transaction
```

### 1. Enviar arquivo da receita

`Prescription_uploadPrescription` envia e armazena o documento digitalizado.
O arquivo permanece na máquina da integração antes do envio e é transmitido em
`multipart/form-data`:

- `operations`: mutation GraphQL com `variables.file` inicialmente nulo;
- `map`: associação do arquivo enviado a `variables.file`;
- `uploaded_file`: arquivo digitalizado da receita.

Os dados de identificação usados no exemplo atual são `cardNumber`, `source`,
e, quando aplicáveis, `cpf`, `mime`, `prescriptionName` e `dateIssuance`.
Aceitar somente arquivos JPEG, JPG, PNG ou PDF, de até 2 MB. Rejeitar o envio
quando o tipo for diferente ou o arquivo exceder esse limite. URL de receita
não é aceita neste fluxo. O resultado a preservar é o `id` da receita enviada.

Não há vínculo com a venda nesta chamada: `authorization`, `sequence` e
`timestamp` não pertencem ao upload.

### 2. Vincular receita à pré-autorização

`Prescription_bindPrescription` associa a receita já enviada à transação
pré-autorizada. A entrada contém:

- `prescriptionIDs`: lista com todos os IDs retornados nos uploads da venda;
- `transaction.authorization`;
- `transaction.sequence`;
- `transaction.timestamp`.

Os dados da pré-autorização alimentam diretamente a transação do vínculo:

- `authorizationID` → `authorization`;
- `sequenceID` → `sequence`;
- `createdAt` → `timestamp`.

Uma venda pode possuir mais de uma receita: guardar cada ID retornado e enviar
a lista completa em `prescriptionIDs`. Só depois do vínculo concluído o fluxo
pode resgatar a transação e confirmar a venda.

## Cenários de teste a registrar

### Receita obrigatória — BF e PBM

1. Executar `Pharma_checkPricesAndRules` e obter
   `requiredUploadWithPrescription = true`.
2. Pré-autorizar a venda com `Sales_preAuthorizeSale`.
3. Enviar arquivo digitalizado com `Prescription_uploadPrescription`.
4. Validar JPEG, JPG, PNG ou PDF de até 2 MB; registrar a rejeição de tipo
   inválido e de arquivo acima do limite.
5. Preservar cada `id` de receita retornado.
6. Vincular a lista completa de receitas e os identificadores da
   pré-autorização com
   `Prescription_bindPrescription`.
7. Consultar `Sales_transaction` e confirmar a venda.

As evidências devem ser mascaradas: flag de exigência, IDs de receita e da
transação e confirmação do vínculo. Não anexar o arquivo nem dados reais de
paciente, prescritor ou cartão.

### Fluxos de retorno PBM

- paciente não cadastrado → Cadastro → verificação de Opt-in;
- Opt-in obrigatório sem aceite → Opt-in → exibição da regra no balcão;
- Opt-in não obrigatório ou já aceito → exibição da regra no balcão;
- receita não obrigatória → seguir diretamente para `Sales_transaction`.

## Pendências que não devem virar ramo por suposição

1. Conduta após erro operacional de upload ou de vínculo, diferente das
   validações já definidas de tipo e tamanho: retentativa, cancelamento ou
   outro tratamento operacional.
2. Correção da referência atual que ainda registra o upload como
   `Prescription_addPrescription`; o nome de mutation adotado neste protocolo é
   `Prescription_uploadPrescription`.

## Próxima implementação

1. Corrigir a operação de upload e o cenário de receita nos manuais de Venda e
   PBM, mantendo o vínculo como operação distinta.
2. Criar em `content/projects/credenciado-venda/flow.json` os fluxos
   `venda-bf` e `venda-pbm` a partir deste protocolo.
3. Atualizar as seções de Fluxogramas de Venda, Cadastro, Opt-in e PBM no Caixa
   com os links e a orientação de navegação após a publicação visual.
4. Validar visualmente cada decisão e executar typecheck, lint e E2E antes de
   publicar os diagramas.
