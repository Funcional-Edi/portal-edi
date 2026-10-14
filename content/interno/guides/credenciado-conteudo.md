# Credenciado — agrupamento de conteúdo para o Portal EDI

Documento de refinamento para migrar o conteúdo do Gateway de Credenciados para
o padrão de navegação do Canal Autorizador. Esta etapa organiza e relaciona o
conteúdo aprovado nas páginas de origem; ainda não publica os módulos no portal.

## Objetivo

Preparar a documentação do produto **Credenciado** para que o fornecedor
consiga localizar, em cada fluxo, o contexto, a jornada, as operações da API,
os cenários de validação e os materiais de homologação.

O conteúdo deve seguir a mesma lógica do Canal Autorizador:

- primeiro nível na navegação do produto;
- índices próprios para cada área selecionada;
- Documentação para contexto, segurança, fluxogramas, regras de negócio e
  histórico;
- Jornada da Integração para a sequência funcional e as operações utilizadas;
- Cenários de Testes e Validações para fluxos, origens, pré-condições e
  evidências;
- referências técnicas junto da etapa que as utiliza;
- uma fonte editável em Markdown, sem duplicar o mesmo conteúdo em áreas
  diferentes.

## Conteúdos disponíveis no portal

| Conteúdo | Rota no portal |
|---|---|
| Fluxo de Cadastro | [`/docs/credenciado-cadastro`](/docs/credenciado-cadastro) |
| Fluxo Opt-in | [`/docs/credenciado-optin`](/docs/credenciado-optin) |
| Fluxo de Venda | [`/docs/credenciado-venda`](/docs/credenciado-venda) |
| Fluxo PBM no Caixa | [`/docs/credenciado-pbm-caixa`](/docs/credenciado-pbm-caixa) |
| Referência GraphQL — queries, mutations e schema | [`/docs/api`](/docs/api) |
| Estrutura de navegação | Jornada e seções organizadas em cada produto |

As rotas acima são a fonte de consulta do portal. Quando uma seção estiver
pendente, a própria página deve registrar o que falta validar ou consolidar.

## Estrutura do produto

O primeiro nível deve ser comum ao produto Credenciado. O conteúdo interno de
cada fluxo permanece específico e não deve ser substituído por uma lista única
de operações.

```text
Credenciado
├── Visão Geral
├── Fluxograma Completo
├── Fluxo de Cadastro
├── Fluxo Opt-in
├── Fluxo de Venda
└── Fluxo PBM no Caixa
```

Quando um fluxo estiver selecionado, a navegação contextual deve apresentar
somente as áreas e os índices daquele fluxo:

```text
Fluxo selecionado
├── Documentação
│   ├── Contexto
│   ├── Diretrizes de Segurança e Consumo da API
│   ├── Fluxogramas
│   ├── Regras de Negócios
│   └── Histórico de Alterações
├── Jornada de Integração
│   └── etapas específicas do fluxo
└── Cenários de Testes e Validações
    ├── Fluxos
    └── Validações
```

`Visão Geral` e `Fluxograma Completo` são recursos do produto. Eles não devem
ser repetidos dentro de cada fluxo nem substituir os índices específicos de
Cadastro, Opt-in, Venda e PBM no Caixa.

## Regras de organização

1. O conteúdo central deve corresponder ao fluxo e à área selecionados.
2. O índice lateral deve acompanhar a área ativa e não mostrar atalhos de outra
   área.
3. Os nomes das operações devem permanecer iguais aos nomes publicados nas
   páginas de origem.
4. Um endpoint ou uma regra deve ter uma fonte principal; links relacionados
   podem apontar para essa fonte sem duplicar o bloco completo.
5. Exemplos de requisição e resposta devem ser preservados na etapa da jornada
   que os utiliza.
6. O conteúdo de homologação deve ficar em Cenários de Testes e Validações,
   não misturado com a explicação funcional da Jornada.
7. As particularidades de cada fluxo devem ser mantidas. A estrutura é comum;
   a lista de etapas, origens, regras e validações é específica.
8. O conteúdo que não estiver validado deve ser marcado como pendente, sem
   inventar endpoint, regra, credencial, e-mail ou exemplo de acesso.
9. A especificação abaixo complementa a Jornada com a assinatura publicada de
   cada query e mutation. Ela é a referência técnica compartilhada pelos fluxos
   e evita repetir contratos GraphQL dentro de cada descrição funcional.

## Subproduto 1 — Fluxo de Cadastro

### Índice do fluxo

```text
Fluxo de Cadastro
├── Documentação
│   ├── Contexto
│   ├── Diretrizes de Segurança e Consumo da API
│   ├── Fluxogramas
│   ├── Regras de Negócios
│   └── Histórico de Alterações
├── Jornada de Integração
│   ├── 1. Criação do token
│   ├── 2. Avaliar elegibilidade
│   ├── 3. Inscrição do beneficiário
│   ├── 4. Inscrição do dependente ou cadastro como paciente
│   ├── 5. Incluir produto a um beneficiário
│   ├── 6. Validar dados do prescritor
│   └── Tabelas de referência
└── Cenários de Testes e Validações
    ├── Fluxos
    └── Validações
```

### Documentação

#### Contexto

O fluxo de cadastro é usado para inscrever uma pessoa em um programa. A
integração começa pela obtenção do token, avalia a elegibilidade do CPF e do
produto e, conforme a política retornada, registra o beneficiário, o dependente
ou o produto associado ao cadastro.

#### Diretrizes de Segurança e Consumo da API

Manter neste índice as orientações transversais da API, incluindo autenticação,
envio do token nas transações, origem da chamada, tratamento de erros e demais
regras de consumo aprovadas. O detalhamento da etapa deve continuar na Jornada;
este índice concentra somente a orientação comum.

#### Fluxogramas

Reservar o mesmo componente editável de fluxograma utilizado pelo Canal
Autorizador. O fluxo deve representar a decisão de elegibilidade e os caminhos
de inscrição de beneficiário, dependente e produto.

#### Regras de Negócios

As regras são derivadas da `registrationPolicy` retornada na avaliação de
elegibilidade. Não transformar uma condição retornada pela API em uma regra
fixa no texto, porque os campos exigidos podem variar por programa e produto.

#### Histórico de Alterações

Usar a fonte de versionamento do subproduto quando ela for criada. Não criar um
segundo histórico manual apenas para este fluxo.

### Jornada de Integração

#### 1. Criação do token

Operação: `createToken`.

O token deve ser obtido antes das transações de cadastro e enviado nas chamadas
subsequentes conforme a regra de autenticação da API. O link da autenticação
deve ser mantido como referência relacionada, sem copiar a documentação inteira
para esta etapa.

#### 2. Avaliar elegibilidade

Operação: `Pharma_assessEligibility`.

Objetivo: avaliar, a partir de CPF e EAN, se o produto pertence a um programa e
se o CPF precisa ser cadastrado no programa ou no produto específico.

Comportamentos que precisam ser documentados:

- quando o CPF não está no programa, a resposta informa os campos necessários
  para o cadastro;
- a resposta também pode informar pacientes vinculados ao CPF;
- `requiresBeneficiaryRegistration=true` indica que o CPF ainda precisa ser
  cadastrado;
- `requiresBeneficiaryRegistration=false` indica que o beneficiário já está
  cadastrado;
- guardar `eligibilityAssessment.programCode` para a etapa de inscrição;
- a aplicação deve respeitar a política retornada, em vez de exibir todos os
  campos indiscriminadamente.

#### Estrutura de `eligibilityAssessment`

Registrar na documentação da operação:

- `programCode`;
- `belongsToIndustryProgram`;
- `programDescription`;
- `productDescription`.

#### Estrutura de `registrationPolicy`

Registrar como referência da etapa:

- `allowDependents`;
- `dependentsLimit`;
- `requiresBeneficiaryRegistration`;
- `requiresMedicalPrescriptionRegistration`;
- `requiresAtLeastOneContactMedium`;
- `requiresMedicalPrescriber`;
- `isRegistered`;
- `originPermitedRegister`;
- `urlRegisterSite`;
- `beneficiaryFields`;
- `dependentFields`;
- `medicalPrescriptionFields`;
- `extraFields`;
- `extraFormFields`;
- `allowedOrigins`.

Os grupos `beneficiaryFields`, `dependentFields`,
`medicalPrescriptionFields` e `extraFields` usam campos com:

- `field`;
- `label`;
- `type`;
- `description`;
- `display`;
- `entity`;
- `defaultValue`;
- `options.text` e `options.value`.

Os valores de `display` devem ser tratados como política de apresentação:

- `HIDDEN`: não exibir;
- `OPTIONAL`: exibir sem obrigatoriedade;
- `REQUIRED`: exibir e exigir preenchimento.

#### Estrutura de `extraFormFields`

Preservar a referência dos campos dinâmicos:

- `QuestionCode`;
- `ParentQuestionCode`;
- `ProgramCode`;
- `ProductName`;
- `DisplayTitle`;
- `MultipleChoice`;
- `Mandatory`;
- `DisplayOrder`;
- `QuestionHint`;
- `ControlType`;
- `QuestionTypeFlag`;
- `Answers`;
- `RelatedQuestions`.

Os tipos de controle identificados são `checkboxlist`, `radiobuttonlist`,
`dropdownlist` e `textbox`. Em `Answers`, manter `AnswerCode`, `DisplayTitle`,
`AllowsTypedValue`, `MaxTypedValueSize`, `TypedValue`, `DisplayOrder` e as
perguntas relacionadas.

#### 3. Inscrição do beneficiário

Operação: `Pharma_signUpProgramBeneficiary`.

É a operação agregadora para inscrever o beneficiário no programa e no produto,
quando a política exigir o cadastro.

Entrada principal:

- `programCode`;
- `origin`;
- `storeCode`;
- `customerCode`;
- `productCode`;
- `beneficiaryFields`;
- `medicalPrescriptionFields`;
- `extraFormFields`.

Retorno:

- `status`;
- `message`;
- `errors`.

A etapa deve apontar para a avaliação de elegibilidade e enviar somente os
campos permitidos e exigidos pela política do programa.

#### 4. Inscrição do dependente ou cadastro como paciente

Operação: `Pharma_signUpProgramBeneficiaryDependent`.

Usar somente quando as três condições forem atendidas:

- o beneficiário já está registrado no programa;
- o produto exige registro;
- o programa trabalha com pacientes.

Entrada principal:

- `storeCode`;
- `programCode`;
- `origin`;
- `customerCode` do titular;
- `productCode`;
- `dependentFields`;
- `medicalPrescriptionFields`.

Retorno:

- `status`;
- `message`;
- `errors`.

Manter o vínculo com `Pharma_assessEligibility`, pois a elegibilidade define se
esta etapa é necessária.

#### 5. Incluir produto a um beneficiário

Operação: `Pharma_addProgramBeneficiaryToProduct`.

Usar para incluir um produto no cadastro do beneficiário. Quando aplicável,
`dependentID` associa o paciente ou dependente correspondente.

Entrada principal:

- `origin`;
- `programCode`;
- `storeCode`;
- `customerCode`;
- `productCode`;
- `dependentID`;
- `medicalPrescriptionFields`;
- `extraFormFields`.

Retorno:

- `status`;
- `message`;
- `errors`.

#### 6. Validar dados do prescritor

Operação: `Pharma_prescriber`.

Validar o prescritor antes das operações que dependem de receita. A operação é
exposta para apoiar as interfaces dos parceiros.

Entrada `data`:

- `council`;
- `stateAbbr`;
- `registerNumber`.

Retorno:

- `status`;
- `message`;
- `errors`.

### Tabelas de referência

O fluxo de Cadastro não deve receber uma tabela fixa que contradiga a política
retornada pela API. O índice de referências deve explicar os modelos de campos,
opções, valores de `display`, controles dinâmicos e origens permitidas.

### Cenários de Testes e Validações

#### Fluxos

Organizar ao menos os seguintes cenários, condicionados aos dados disponíveis
em homologação:

1. beneficiário ainda não cadastrado;
2. beneficiário já cadastrado;
3. inscrição de beneficiário com campos obrigatórios;
4. inscrição de dependente quando permitida;
5. inclusão de produto para beneficiário existente;
6. validação de prescritor;
7. produto ou programa não elegível;
8. erro de validação retornado em `errors`.

#### Validações

Conferir se a interface exibe os campos segundo `HIDDEN`, `OPTIONAL` e
`REQUIRED`, respeita limites de dependentes, envia o `programCode` avaliado,
mantém a origem autorizada e apresenta `status`, `message` e `errors` sem
expor dados sensíveis.

## Subproduto 2 — Fluxo Opt-in

### Índice do fluxo

```text
Fluxo Opt-in
├── Documentação
│   ├── Contexto
│   ├── Diretrizes de Segurança e Consumo da API
│   ├── Fluxogramas
│   ├── Regras de Negócios
│   └── Histórico de Alterações
├── Jornada de Integração
│   ├── Termo via SMS/e-mail
│   │   ├── Verificar Opt-in
│   │   └── Enviar termos Opt-in
│   └── Termo exibido em tela
│       ├── Recuperar texto dos termos
│       └── Inserir Opt-in
└── Cenários de Testes e Validações
    ├── Fluxos
    │   └── Tabela de origem
    └── Validações
```

### Documentação

#### Contexto

O fluxo Opt-in verifica se o CPF aceitou os termos de consentimento e oferece
dois caminhos: envio dos termos por SMS/e-mail ou exibição dos termos na
interface do parceiro para confirmação em tela.

#### Diretrizes, Fluxogramas, Regras de Negócios e Histórico

Usar os quatro índices com o mesmo significado do padrão do Credenciado. As
regras de obrigatoriedade do consentimento devem permanecer na jornada, junto
da operação que verifica ou registra o aceite.

### Jornada de Integração

#### Grupo A — Envio do termo por SMS/e-mail

##### 1. Verificar Opt-in

Operação: `Pharma_verifyOptIn`.

Verificar se o CPF aceitou os termos e se o aceite é obrigatório. Essa consulta
deve ser feita durante atualizações de cadastro e nos momentos de autorização ou
compra.

Entrada:

- `EAN`;
- `CPF`;
- `CNPJ`;
- `Origem`;
- `CodCre`;
- `origin: POINT_OF_SALES`.

Retorno:

- `OptInRealizado`;
- `OptInObrigatorio`;
- `Mensagem`.

##### 2. Enviar termos Opt-in

Operação: `Pharma_sendOptInTerms`.

Enviar os termos por e-mail e/ou SMS de acordo com os dados informados. A
mensagem contém o link para a página de aceite.

Entrada:

- `Ean`;
- `CPF`;
- `TelefoneCelular`;
- `Email`;
- `Origem`;
- `origin: POINT_OF_SALES`.

Retorno:

- `Status`;
- `Mensagem`.

#### Grupo B — Exibição do termo em tela

##### 3. Recuperar texto dos termos

Operação: `Pharma_retrieveTextTermsOptIn`.

Recuperar o conteúdo integral que deve ser apresentado pelo credenciado ou
parceiro, sem depender do envio por SMS ou e-mail.

Entrada:

- `Ean`;
- `CPF`;
- `Origem`;
- `origin: POINT_OF_SALES`.

Retorno:

- `CodigoEnvio`;
- `TextoTermos`;
- `LinkTermos`;
- `Status`;
- `Mensagem`.

##### 4. Inserir Opt-in

Operação: `Pharma_insertOptIn`.

Confirmar o aceite do beneficiário depois de `Pharma_retrieveTextTermsOptIn`.

Entrada:

- `CodigoEnvioTermos`;
- `Origem`;
- `origin: POINT_OF_SALES`.

Retorno:

- `Status`;
- `Mensagem`.

### Cenários de Testes e Validações

#### Fluxos e tabela de origem

A tabela de origem deve ser vinculada às validações, com as origens mapeadas na
documentação recebida:

- Ecommerce;
- Mobile App;
- Point of Sale;
- Call Center;
- Todas Marketplaces;
- Mevo;
- iFood.

O índice deve explicar quais origens são aceitas para cada fluxo quando essa
informação for retornada ou validada pelo time responsável. Não assumir que
`POINT_OF_SALES` da operação é equivalente a todas as origens da tabela.

#### Validações

Validar aceite já realizado, aceite obrigatório, envio por SMS, envio por
e-mail, ausência de um canal de contato, exibição em tela, confirmação após a
leitura e tratamento de `Status` e `Mensagem`.

## Subproduto 3 — Fluxo de Venda

### Índice do fluxo

```text
Fluxo de Venda
├── Documentação
│   ├── Contexto
│   ├── Diretrizes de Segurança e Consumo da API
│   ├── Fluxogramas
│   ├── Regras de Negócios
│   └── Histórico de Alterações
├── Jornada de Integração
│   ├── Pré-venda
│   ├── Fluxo da venda pré-autorizada
│   │   ├── Criação do token
│   │   ├── Validar regras
│   │   ├── Pré-autorizar venda
│   │   ├── Anexar receita
│   │   ├── Consultar transação
│   │   └── Confirmar autorização
│   ├── Informações adicionais
│   │   ├── Consultar regras de desconto
│   │   ├── Consultar beneficiário
│   │   └── Atualizar dados da NF
│   ├── Processos diários de carga
│   └── Cancelamento
└── Cenários de Testes e Validações
    ├── Contexto e explicação
    ├── Download da documentação do roteiro de homologação
    └── Validações
```

### Documentação

#### Contexto

A pré-venda é uma autorização prévia normalmente realizada no balcão para
negociação e consulta antes do caixa. O número da pré-autorização é usado para
confirmar a venda no Gateway.

Regras de contexto que devem permanecer visíveis:

- a pré-autorização tem validade máxima de 30 dias;
- recomenda-se confirmar o quanto antes, idealmente no mesmo dia e no ponto de
  venda;
- uma pré-autorização posterior, quando confirmada, impede a confirmação da
  anterior;
- se qualquer item for inválido, a autorização não deve ser tratada como
  validada; remover o item e reenviar a solicitação para que o beneficiário veja
  todas as condições antes da confirmação;
- enviar `origin: POINT_OF_SALES` para ponto de venda;
- enviar `origin: PARTNERS_ECOMMERCE` para e-commerce.

#### Diretrizes, Fluxogramas, Regras de Negócios e Histórico

Os fluxogramas devem ser editáveis no mesmo modelo usado pelo projeto. As regras
de validade, itens inválidos, confirmação e cancelamento devem ser explicadas
uma vez na documentação e referenciadas pelas etapas da Jornada.

### Jornada de Integração

#### 1. Criação do token

Operação: `createToken`.

Obter e enviar o token nas transações do fluxo de venda.

#### 2. Validar regras

Operação: `Pharma_checkPricesAndRules`.

Executar uma simulação para validar preços e regras antes da pré-autorização.

Entrada:

- `origin`;
- `storeCode`;
- `customerCode`;
- `products[]`;
- produto com `ean`, `price` e `saleAmount`;
- `medicalPrescription` com `quantity`, `date` e `prescriber`;
- prescritor com `council`, `stateAbbr` e `registerNumber`.

Saída e regras de apresentação:

- `aproved`;
- `createdAt`;
- totais, descontos e produtos;
- status e preços dos produtos;
- `requiredUploadWithPrescription`;
- dados de receita;
- `dailyDose`;
- `requiredInformDailyDose`.

`dailyDose` deve ser solicitado quando `requiredInformDailyDose` indicar que a
informação é necessária. Essa exigência é relevante para compras que exigem
receita.

#### 3. Pré-autorizar uma venda

Operação: `Sales_preAuthorizeSale`.

Criar a pré-autorização para negociação e garantia da venda. A pré-autorização
não representa uma venda concluída até a confirmação.

Entrada:

- `channel`: `PHARMA` ou `BENEFITS`;
- `origin`;
- `customerCode`;
- `storeCode`;
- produtos com `ean`, `unitPrice`, `quantity` e `maxConsumerPrice` opcional;
- `medicalPrescription` com `date`, `quantity`, `usage` e `prescriber`.

Saída:

- `createdAt`;
- `authorizationID`;
- `sequenceID`;
- totais;
- `status`;
- códigos e mensagens;
- `secondFactorAuthentication`;
- status dos produtos;
- dados da receita e `dailyDose`.

Quando uma autorização tiver um item com erro e outro item aprovado, criar uma
nova autorização somente com os itens recusados. O `authorizationID` deve ser
preservado para as etapas seguintes.

#### 4. Anexar uma receita à venda

Executar esta etapa quando `requiredUploadWithPrescription` indicar necessidade
de receita.

Operações:

1. `Prescription_addPrescription`, via multipart;
2. `Prescription_bindPrescription`, vinculando a receita à transação.

No multipart, preservar os campos `operations`, `map` e `uploaded_file`. O mapa
da fonte é `{"uploaded_file":["variables.file"]}` e o arquivo possui limite de
2 MB.

No vínculo, utilizar os identificadores da receita e a transação com:

- `authorization`;
- `sequence`;
- `timestamp`.

#### 5. Consultar uma transação

Operação: `Sales_transaction`.

Consultar a pré-autorização para obter os dados necessários à finalização.

Entrada:

- `storeCode`;
- `customerCode`;
- `authorizationID`;
- `createdAt` quando a consulta não for do mesmo dia.

O retorno deve ser usado para verificar a transação, os produtos, os status e a
receita antes da confirmação.

#### 6. Confirmar uma autorização

Operação: `Sales_confirmPreAuthorizedSale`.

Finalizar a venda pré-autorizada.

Regras:

- não adicionar produtos na confirmação;
- não exceder a quantidade pré-autorizada;
- validar `status` e `statusMessage`;
- a mesma venda não pode ser confirmada duas vezes;
- uma segunda confirmação retorna `Pre-Autorizacao nao encontrada`;
- sem `preAuthorizationDate`, considerar apenas pré-autorizações do mesmo dia.

Entrada:

- `customerCode`;
- `origin`;
- `storeCode`;
- `authorizationID`;
- `preAuthorizationDate`;
- `invoiceCode` opcional;
- `invoiceAuthProtocol` opcional;
- produtos.

Saída:

- totais;
- `status`;
- `reimbursementValue`;
- `receipt`;
- produtos;
- `statusMessage` quando houver erro.

### Informações adicionais

#### Consultar regras de desconto do produto

Operação: `Pharma_displayProductDiscountRules`.

Preservar no conteúdo os retornos de status, mensagem, programa, prioridade,
produtos e descontos.

#### Consultar beneficiário

Operação: `Sales_customerMemberships`.

Consultar código e nome do cliente e suas associações. As associações possuem
`id`, `name`, `type`, `description` e `salingMessage`. Para PBM, a consulta
valida os programas associados ao CPF.

#### Atualizar dados da nota fiscal

Operação: `Sales_updateInvoiceCode`.

Entrada:

- `storeCode`;
- `invoiceCode`;
- `invoiceAuthProtocol`;
- `authorizationID`;
- `saleDate`.

Preservar os campos de status, código e mensagem da resposta.

### Processos diários de carga

Operação: `Pharma_discountPrograms`.

Consultar os programas usando CNPJ da loja e origem. A documentação deve
preservar:

- programas disponíveis;
- `allowedOrigins`;
- URL;
- regras com `id` e `description`;
- nome e embalagem do produto;
- EANs;
- `maximumConsumerPrice`;
- `saleBaseDiscountPercentage`;
- `repositionBaseDiscountPercentage`;
- `blocked`;
- `requiresMedicalPrescription`;
- `witholdsMedicalPrescription`.

As cargas devem ser atualizadas diariamente. A integração precisa analisar a
resposta completa, especialmente `allowedOrigins`.

### Cancelamento

Operação: `Sales_cancel`.

Cancelar uma venda confirmada utilizando o `authorizationID` retornado por
`Sales_confirmPreAuthorizedSale`. A fonte também permite informar
`preAuthorizationID` conforme o caso.

Entrada:

- `channel`;
- `origin`;
- `customerCode`;
- `storeCode`;
- `authorizationID` ou `preAuthorizationID`;
- `createdAt` quando não for do mesmo dia.

Saída:

- `createdAt`;
- `authorizationID`;
- `status`;
- `statusCode`;
- `statusMessage`;
- `receipt`.

Para uma transação já cancelada, preservar `statusCode 103` e a mensagem
`Transacao ja cancelada`.

### Cenários de Testes e Validações

#### Contexto e explicação

Descrever o fluxo de pré-venda, regras de validade, origem, confirmação e
cancelamento antes dos cenários técnicos.

#### Roteiro de homologação

Disponibilizar o link para o roteiro de homologação e a documentação de evidências. O
roteiro deve permanecer como referência do processo de homologação, não como
uma cópia da Jornada.

#### Validações

Validar venda aprovada, item inválido, receita obrigatória, upload de receita,
pré-autorização expirada, confirmação fora da data, tentativa de confirmação
duplicada, inclusão de NF, consulta de programas, cancelamento e tentativa de
cancelamento duplicado.

## Subproduto 4 — Fluxo PBM no Caixa

### Índice do fluxo

```text
Fluxo PBM no Caixa
├── Documentação
│   ├── Contexto
│   ├── Diretrizes de Segurança e Consumo da API
│   ├── Fluxogramas
│   ├── Regras de Negócios
│   └── Histórico de Alterações
├── Jornada de Integração
│   ├── Criação do token
│   ├── Avaliar elegibilidade
│   ├── Validar regras
│   ├── Pré-autorizar venda
│   ├── Confirmar autorização
│   ├── Atualizar dados da NF
│   ├── Processos diários de carga
│   └── Cancelamento
└── Cenários de Testes e Validações
    ├── Fluxos
    │   └── Tabela de origem
    └── Validações
```

### Documentação

O fluxo PBM no Caixa reutiliza a estrutura comum do Credenciado, mas mantém
suas regras próprias de elegibilidade, faturamento e quantidade de itens. O
fluxograma deve ser o modelo editável do projeto, não uma imagem solta sem
fonte de manutenção.

### Jornada de Integração

#### 1. Criação do token

Operação: `createToken`.

Obter o token antes das operações do fluxo.

#### 2. Avaliar elegibilidade

A etapa avalia CPF e EAN para verificar programa e necessidade de cadastro. A
página do fluxo PBM descreve a etapa, mas não nomeia a operação nessa seção.
Confirmar com o responsável se a operação oficial é `Pharma_assessEligibility`
antes de publicar esse nome no conteúdo do PBM.

#### 3. Validar regras

Operação: `Pharma_checkPricesAndRules`.

Manter a mesma estrutura de entrada e saída do Fluxo de Venda, incluindo
`origin`, loja, cliente, produtos, receita, `requiredUploadWithPrescription`,
`dailyDose` e `requiredInformDailyDose`.

#### 4. Pré-autorizar venda

Operação: `Sales_preAuthorizeSale`.

Manter `channel`, `origin`, cliente, loja, produtos, preços, quantidade e dados
do prescritor. Quando uma operação tiver itens aprovados e recusados, criar uma
nova autorização somente com os itens recusados e preservar o
`authorizationID`.

#### 5. Confirmar autorização

Operação: `Sales_confirmPreAuthorizedSale`.

Não adicionar produtos nem exceder as quantidades pré-autorizadas. Validar
`status` e `statusMessage`, impedir confirmação duplicada e manter os retornos
de totais, `reimbursementValue`, `receipt` e produtos.

#### 6. Atualizar dados da nota fiscal

Operação: `Sales_updateInvoiceCode`.

Manter `storeCode`, `invoiceCode`, `invoiceAuthProtocol`, `authorizationID` e
`saleDate`.

### Processos diários de carga

Operação: `Pharma_discountPrograms`.

Consultar programas com loja e origem, atualizar diariamente e analisar
`allowedOrigins`, regras de desconto, EANs, limites de preço, bloqueio e
necessidade de receita.

### Cancelamento

Operação: `Sales_cancel`.

Cancelar a autorização usando os dados da confirmação. Preservar origem, canal,
cliente, loja, `authorizationID`, `createdAt`, status, código, mensagem e
recibo. Para transação já cancelada, manter `statusCode 103` e a mensagem
`Transacao ja cancelada`.

### Cenários de Testes e Validações

#### Fluxos e tabela de origem

Manter o índice de fluxos separado do conteúdo da Jornada e registrar a tabela
de origem validada para o PBM no Caixa. A origem efetivamente aceita deve ser
confirmada por ambiente e contrato antes de virar regra fixa.

#### Validações

Validar elegibilidade, regras de preço, venda total, venda parcial, cancelamento,
quantidade faturada, atualização de NF, status final, programas carregados e
tratamento de itens recusados.

## Roteiro de Homologação

O roteiro é uma referência de validação para os fluxos de venda e PBM no Caixa.
Ele deve ser acessível dentro de Cenários de Testes e Validações, sem duplicar a
Jornada de Integração.

### Evidências obrigatórias

Para concluir a homologação, o fornecedor deve documentar o que foi desenvolvido
em Word ou PDF, com capturas de tela da venda passo a passo dentro do software.
Quando necessário, incluir instruções para chegar às telas utilizadas.

A liberação depende de:

- documentação do processo;
- evidência de pelo menos uma venda;
- validação do layout do recibo do relatório gerencial.

### Dados para vendas de teste

- clientes de teste e CRM devem ser solicitados ao time EDI ou ao analista
  responsável pela integração;
- medicamento: qualquer medicamento;
- data da receita: usar a data da simulação.

### Cenários mínimos de homologação

Apresentar evidências para:

- benefício farmácia total;
- benefício farmácia parcial;
- venda à vista;
- upload de receita, com teste de digitalização da receita.

## Mapa de operações por subproduto

| Subproduto | Operações e referências principais |
|---|---|
| Cadastro | `createToken`, `Pharma_assessEligibility`, `Pharma_signUpProgramBeneficiary`, `Pharma_signUpProgramBeneficiaryDependent`, `Pharma_addProgramBeneficiaryToProduct`, `Pharma_prescriber` |
| Opt-in | `Pharma_verifyOptIn`, `Pharma_sendOptInTerms`, `Pharma_retrieveTextTermsOptIn`, `Pharma_insertOptIn` |
| Venda | `createToken`, `Pharma_checkPricesAndRules`, `Sales_preAuthorizeSale`, `Prescription_addPrescription`, `Prescription_bindPrescription`, `Sales_transaction`, `Sales_confirmPreAuthorizedSale`, `Pharma_displayProductDiscountRules`, `Sales_customerMemberships`, `Sales_updateInvoiceCode`, `Pharma_discountPrograms`, `Sales_cancel` |
| PBM no Caixa | `createToken`, avaliação de elegibilidade a confirmar, `Pharma_checkPricesAndRules`, `Sales_preAuthorizeSale`, `Sales_confirmPreAuthorizedSale`, `Sales_updateInvoiceCode`, `Pharma_discountPrograms`, `Sales_cancel` |

## Pontos pendentes de validação

- confirmar se o primeiro nível deve usar exatamente `Fluxo Opt-in` ou
  `Fluxo OptIn`, mantendo o padrão aprovado pelo responsável;
- confirmar o nome da operação de elegibilidade no fluxo PBM no Caixa;
- confirmar a origem efetiva de cada subproduto e o vínculo das tabelas de
  origem;
- receber ou criar os fluxogramas editáveis dos quatro fluxos no modelo já
  utilizado pelo portal;
- definir a fonte de histórico e versão do Credenciado;
- revisar os exemplos integrais de requisição e resposta antes de publicar;
- validar quais regras de segurança são comuns ao produto e quais pertencem a
  cada subproduto;
- conferir se a nomenclatura final de `origin`, `Origem`, `EAN`, `Ean`, `CPF`,
  `CNPJ` e `CodCre` deve preservar a capitalização apresentada nas fontes;
- validar no ambiente de homologação os cenários e os dados de teste.

## Critérios de aceite do refinamento

- os quatro subprodutos possuem agrupamento próprio em Markdown;
- a estrutura de navbar e os índices internos seguem o padrão do Canal
  Autorizador;
- cada fluxo possui Documentação, Jornada e Cenários de Testes e Validações;
- todas as operações identificadas nas cinco páginas de origem foram
  relacionadas ao subproduto correto;
- as referências de tabelas e origens ficam junto do fluxo que as utiliza;
- o Roteiro de Homologação está relacionado aos cenários sem duplicar a Jornada;
- a diferença entre estrutura comum e particularidades de cada fluxo está
  explícita;
- nenhum endpoint, regra, origem ou exemplo pendente é tratado como validado;
- a documentação fica pronta para ser dividida nas fontes publicáveis do
  projeto depois da revisão do responsável.

## Próxima etapa

Após a aprovação deste agrupamento, dividir o conteúdo nas fontes publicáveis
do projeto, mantendo uma única origem por seção e por operação. Só depois ligar
os módulos `fluxo-de-cadastro`, `fluxo-optin`, `fluxo-venda` e
`fluxo-pbm-caixa` à navegação do Credenciado e aplicar os fluxogramas no editor
existente.

## Complemento técnico da Jornada — referência GraphQL

Esta seção complementa as etapas da Jornada com os contratos publicados na
API Reference. Operações compartilhadas por Venda e PBM no Caixa têm uma única
especificação aqui, para evitar versões duplicadas do mesmo contrato.

### Como interpretar os contratos

- Em argumentos e objetos de entrada, `!` significa obrigatório no schema
  GraphQL; um campo sem `!` é opcional para o schema.
- A obrigatoriedade técnica não substitui pré-condições do processo. Se a
  jornada exigir um campo que o schema deixa opcional, enviar conforme o
  processo e registrar a diferença para validação do responsável.
- Nas respostas, a coluna **Obrigatório** representa a nulabilidade do schema.
- Os exemplos usam valores fictícios. Não incluir tokens, CPF, e-mail, telefone
  ou outros dados reais.
- A referência consultada não expõe `createToken` nesse conjunto de operações.
  Manter a autenticação ligada à documentação própria, sem inventar seu
  contrato ou tipo de resposta.
- Quando um campo não tiver descrição publicada, não completar por suposição.

### Fluxo de Cadastro

#### `Pharma_assessEligibility` — query

**Descrição:** avalia, a partir de CPF e EAN, se o produto pertence a um
programa e se o beneficiário precisa ser inscrito no programa ou no produto.

**Pré-requisitos:** token obtido conforme documentação de autenticação; origem,
CNPJ de cadastro, EAN de 13 dígitos e CPF.

**Observação:** `registrationPolicy` determina os campos e condições da
inscrição; usar o `programCode` retornado nas mutations. Não substituir essa
política dinâmica por um formulário fixo.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `origin` | `Pharma_AuthorizationOrigin!` | Sim | Origem da solicitação. |
| `storeCode` | `String!` | Sim | CNPJ da origem que deseja efetuar o cadastro. |
| `productCode` | `String!` | Sim | EAN de 13 dígitos do produto. |
| `customerCode` | `String!` | Sim | CPF do beneficiário. |

**Campos da resposta (`Pharma_AssessEligibilityResponse!`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `validationResult` | `Pharma_ValidationResult!` | Sim | Resultado da validação. |
| `eligibilityAssessment` | `Pharma_EligibilityAssessment!` | Sim | Programa e produto identificados. |
| `registrationPolicy` | `Pharma_RegistrationPolicy!` | Sim | Regras e campos de cadastro. |
| `dependents` | `[Pharma_Dependent!]!` | Sim | Pacientes/dependentes associados, se existentes. |

**Exemplo GraphQL**

```graphql
query Pharma_assessEligibility(
  $origin: Pharma_AuthorizationOrigin!,
  $storeCode: String!,
  $productCode: String!,
  $customerCode: String!
) {
  Pharma_assessEligibility(
    origin: $origin, storeCode: $storeCode,
    productCode: $productCode, customerCode: $customerCode
  ) {
    validationResult { ...Pharma_ValidationResultFragment }
    eligibilityAssessment { ...Pharma_EligibilityAssessmentFragment }
    registrationPolicy { ...Pharma_RegistrationPolicyFragment }
    dependents { ...Pharma_DependentFragment }
  }
}
```

#### `Pharma_signUpProgramBeneficiary` — mutation

**Descrição:** cadastra o beneficiário no programa e no produto, podendo
incluir dependente quando exigido pelo programa.

**Pré-requisitos:** avaliar elegibilidade, usar os códigos retornados e coletar
somente os campos indicados por `registrationPolicy`.

**Observação:** os campos dinâmicos são enviados em `Pharma_FormField` ou
`Pharma_FormExtraField`, conforme o grupo. Respeitar a política de cadastro do
programa.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `input` | `Pharma_RegisterBeneficiaryRequest!` | Sim | Dados do cadastro. |
| `input.origin` | `Pharma_AuthorizationOrigin!` | Sim | Origem da solicitação. |
| `input.storeCode` | `String!` | Sim | CNPJ da origem do cadastro. |
| `input.customerCode` | `String!` | Sim | CPF do beneficiário. |
| `input.productCode` | `String!` | Sim | EAN do produto. |
| `input.programCode` | `ID!` | Sim | Código retornado pela elegibilidade. |
| `input.beneficiaryFields` | `[Pharma_FormField!]!` | Sim | Campos do beneficiário. |
| `input.medicalPrescriptionFields` | `[Pharma_FormField!]!` | Sim | Campos cadastrais do produto. |
| `input.dependentFields` | `[Pharma_FormField!]` | Não | Campos de dependente. |
| `input.extraFields` | `[Pharma_FormField!]` | Não | Campos extras. |
| `input.extraFormFields` | `[Pharma_FormExtraField!]` | Não | Respostas a campos dinâmicos extras. |

**Campos da resposta (`Pharma_ValidationResult!`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `status` | `Pharma_RequestStatus!` | Sim | Resultado: `SUCCESS` ou `ERROR`. |
| `message` | `String` | Não | Mensagem informativa. |
| `errors` | `[Pharma_ValidationError!]!` | Sim | Lista de erros; cada item contém `message`. |

**Exemplo GraphQL**

```graphql
mutation Pharma_signUpProgramBeneficiary(
  $input: Pharma_RegisterBeneficiaryRequest!
) {
  Pharma_signUpProgramBeneficiary(input: $input) {
    status
    message
    errors { message }
  }
}
```

#### `Pharma_signUpProgramBeneficiaryDependent` — mutation

**Descrição:** cadastra dependente e produto em um único passo.

**Pré-requisitos:** beneficiário já cadastrado no programa, cadastro do
produto solicitado e programa com suporte a dependentes.

**Observação:** `customerCode` é o CPF do titular. Os dados do dependente são
enviados em `dependentFields` conforme a política cadastral.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `input` | `Pharma_RegisterDependentRequest!` | Sim | Objeto de cadastro. |
| `input.origin` | `Pharma_AuthorizationOrigin!` | Sim | Origem da solicitação. |
| `input.programCode` | `ID!` | Sim | Código do programa. |
| `input.storeCode` | `String!` | Sim | CNPJ da origem do cadastro do dependente. |
| `input.customerCode` | `String!` | Sim | CPF do beneficiário titular. |
| `input.productCode` | `String!` | Sim | EAN do produto. |
| `input.medicalPrescriptionFields` | `[Pharma_FormField!]!` | Sim | Campos cadastrais do produto. |
| `input.dependentFields` | `[Pharma_FormField!]` | Não | Campos do dependente. |
| `input.extraFields` | `[Pharma_FormField!]` | Não | Campos extras. |
| `input.extraFormFields` | `[Pharma_FormExtraField!]` | Não | Respostas a campos dinâmicos extras. |

**Campos da resposta:** mesmo tipo `Pharma_ValidationResult!` da mutation de
cadastro do beneficiário: `status` (`Pharma_RequestStatus!`),
`message` (`String`, opcional) e `errors` (`[Pharma_ValidationError!]!`).

**Exemplo GraphQL**

```graphql
mutation Pharma_signUpProgramBeneficiaryDependent(
  $input: Pharma_RegisterDependentRequest!
) {
  Pharma_signUpProgramBeneficiaryDependent(input: $input) {
    status
    message
    errors { message }
  }
}
```

#### `Pharma_addProgramBeneficiaryToProduct` — mutation

**Descrição:** inclui produto no cadastro de beneficiário e pode associá-lo a
um dependente.

**Pré-requisitos:** beneficiário, programa e produto identificados; campos
dinâmicos do produto coletados segundo a política cadastral.

**Observação:** `dependentID` é opcional no schema e deve ser enviado quando o
produto for associado a dependente específico.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `input` | `Pharma_RegisterProductRequest!` | Sim | Objeto de associação do produto. |
| `input.origin` | `Pharma_AuthorizationOrigin!` | Sim | Origem da solicitação. |
| `input.programCode` | `ID!` | Sim | Código do programa. |
| `input.storeCode` | `String!` | Sim | CNPJ da origem do cadastro do beneficiário no produto. |
| `input.customerCode` | `String!` | Sim | CPF do beneficiário. |
| `input.productCode` | `String!` | Sim | EAN do produto. |
| `input.dependentID` | `String` | Não | ID do dependente, se necessário. |
| `input.medicalPrescriptionFields` | `[Pharma_FormField!]!` | Sim | Campos cadastrais do produto. |
| `input.extraFormFields` | `[Pharma_FormExtraField!]` | Não | Campos extras do produto. |

**Campos da resposta:** mesmo tipo `Pharma_ValidationResult!`, com `status`,
`message` e `errors` conforme descritos na mutation de cadastro.

**Exemplo GraphQL**

```graphql
mutation Pharma_addProgramBeneficiaryToProduct(
  $input: Pharma_RegisterProductRequest!
) {
  Pharma_addProgramBeneficiaryToProduct(input: $input) {
    status
    message
    errors { message }
  }
}
```

#### `Pharma_prescriber` — query

**Descrição:** a referência diz “Consulta um prescritor existe ativamente”;
confirmar com o responsável se a operação valida existência, situação ativa ou
ambas.

**Pré-requisitos:** disponibilizar conselho, UF e número de registro.

**Observação:** o objeto não marca os campos internos como obrigatórios,
embora a validação funcional possa exigi-los. `Pharma_Councils` publica
`CRM`, `CRO` e `CRF`.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `data` | `Pharma_PrescriberRegisterInput!` | Sim | Dados do prescritor. |
| `data.council` | `Pharma_Councils` | Não | Conselho emissor. |
| `data.stateAbbr` | `String` | Não | UF emissora do registro. |
| `data.registerNumber` | `Int` | Não | Número do registro. |

**Campos da resposta (`Pharma_ValidationResult!`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `status` | `Pharma_RequestStatus!` | Sim | Resultado da consulta. |
| `message` | `String` | Não | Mensagem informativa. |
| `errors` | `[Pharma_ValidationError!]!` | Sim | Erros; cada item contém `message`. |

**Exemplo GraphQL**

```graphql
query Pharma_prescriber($data: Pharma_PrescriberRegisterInput!) {
  Pharma_prescriber(data: $data) {
    status
    message
    errors { message }
  }
}
```

### Fluxo Opt-in

#### `Pharma_verifyOptIn` — query

**Descrição:** consulta se o beneficiário aceitou os termos e se o aceite é
obrigatório.

**Pré-requisitos:** token e dados do produto, beneficiário, estabelecimento e
origem.

**Observação:** `OptInRealizado` e `OptInObrigatorio` são `String` no schema,
não `Boolean`. O input declara `Origem: Float!`, enquanto o argumento externo
`origin` é enum. Não converter ou mapear os dois sem validação.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `origin` | `Pharma_AuthorizationOrigin!` | Sim | Origem GraphQL. |
| `input` | `Pharma_OptInRequest!` | Sim | Dados do beneficiário e produto. |
| `input.EAN` | `String!` | Sim | EAN do produto. |
| `input.CPF` | `String!` | Sim | CPF do beneficiário. |
| `input.CNPJ` | `String!` | Sim | CNPJ do estabelecimento. |
| `input.Origem` | `Float!` | Sim | Código numérico; tabela de conversão não publicada. |
| `input.CodCre` | `Float!` | Sim | Código de credenciado do estabelecimento. |

**Campos da resposta (`Pharma_OptInResponse!`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `OptInRealizado` | `String` | Não | Indica se o aceite foi realizado. |
| `OptInObrigatorio` | `String` | Não | Indica se o aceite é obrigatório. |
| `Mensagem` | `String` | Não | Mensagem adicional. |

**Exemplo GraphQL**

```graphql
query Pharma_verifyOptIn(
  $origin: Pharma_AuthorizationOrigin!,
  $input: Pharma_OptInRequest!
) {
  Pharma_verifyOptIn(origin: $origin, input: $input) {
    OptInRealizado
    OptInObrigatorio
    Mensagem
  }
}
```

#### `Pharma_sendOptInTerms` — mutation

**Descrição:** envia os termos ao beneficiário por SMS e/ou e-mail.

**Pré-requisitos:** dados do produto e os contatos requeridos pelo schema.

**Observação:** embora a descrição diga SMS **e/ou** e-mail, `TelefoneCelular`
e `Email` são `String!`. Confirmar se os dois são sempre obrigatórios ou se o
serviço aceita um único canal.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `origin` | `Pharma_AuthorizationOrigin!` | Sim | Origem GraphQL. |
| `input` | `Pharma_EnvioTermosOptInRequest!` | Sim | Produto, beneficiário e contatos. |
| `input.Ean` | `String!` | Sim | EAN do produto. |
| `input.CPF` | `String!` | Sim | CPF do beneficiário. |
| `input.TelefoneCelular` | `String!` | Sim | Telefone do beneficiário. |
| `input.Email` | `String!` | Sim | E-mail do beneficiário. |
| `input.Origem` | `Float!` | Sim | Código numérico; mapeamento pendente. |

**Campos da resposta (`Pharma_EnvioTermosOptInResponse!`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `Status` | `String` | Não | Status do envio. |
| `Mensagem` | `String` | Não | Mensagem adicional. |

**Exemplo GraphQL**

```graphql
mutation Pharma_sendOptInTerms(
  $origin: Pharma_AuthorizationOrigin!,
  $input: Pharma_EnvioTermosOptInRequest!
) {
  Pharma_sendOptInTerms(origin: $origin, input: $input) {
    Status
    Mensagem
  }
}
```

#### `Pharma_retrieveTextTermsOptIn` — query

**Descrição:** recupera os termos, link e código de envio do beneficiário.

**Pré-requisitos:** origem, EAN e CPF.

**Observação:** preservar `CodigoEnvio` para registrar o aceite; a referência
não descreve a validade do código.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `origin` | `Pharma_AuthorizationOrigin!` | Sim | Origem GraphQL. |
| `input` | `Pharma_TextoTermosOptInRequest!` | Sim | Produto e beneficiário. |
| `input.Ean` | `String!` | Sim | EAN do produto. |
| `input.CPF` | `String!` | Sim | CPF do beneficiário. |
| `input.Origem` | `Float!` | Sim | Código numérico; mapeamento pendente. |

**Campos da resposta (`Pharma_TextoTermosOptInResponse!`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `CodigoEnvio` | `String` | Não | Código de envio vinculado ao CPF. |
| `TextoTermos` | `String` | Não | Texto integral dos termos. |
| `LinkTermos` | `String` | Não | URL da página dos termos. |
| `Status` | `String` | Não | Status da operação. |
| `Mensagem` | `String` | Não | Mensagem adicional. |

**Exemplo GraphQL**

```graphql
query Pharma_retrieveTextTermsOptIn(
  $origin: Pharma_AuthorizationOrigin!,
  $input: Pharma_TextoTermosOptInRequest!
) {
  Pharma_retrieveTextTermsOptIn(origin: $origin, input: $input) {
    CodigoEnvio
    TextoTermos
    LinkTermos
    Status
    Mensagem
  }
}
```

#### `Pharma_insertOptIn` — mutation

**Descrição:** registra o aceite usando um código de envio.

**Pré-requisitos:** ter recuperado/enviado os termos e possuir o
`CodigoEnvioTermos` correspondente ao beneficiário.

**Observação:** argumento externo `origin` é enum; `input.Origem` é `Float!`.
O mapeamento entre ambos não está descrito na referência.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `origin` | `Pharma_AuthorizationOrigin!` | Sim | Origem GraphQL. |
| `input` | `Pharma_InserirOptInRequest!` | Sim | Código de envio e origem. |
| `input.CodigoEnvioTermos` | `String!` | Sim | Código dos termos vinculado ao CPF. |
| `input.Origem` | `Float!` | Sim | Código numérico; mapeamento pendente. |

**Campos da resposta (`Pharma_InserirOptInResponse!`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `Status` | `String` | Não | Status do registro. |
| `Mensagem` | `String` | Não | Mensagem adicional. |

**Exemplo GraphQL**

```graphql
mutation Pharma_insertOptIn(
  $origin: Pharma_AuthorizationOrigin!,
  $input: Pharma_InserirOptInRequest!
) {
  Pharma_insertOptIn(origin: $origin, input: $input) {
    Status
    Mensagem
  }
}
```

### Fluxo de Venda e PBM no Caixa — operações compartilhadas

As operações a seguir são usadas pelas Jornadas de Venda e PBM no Caixa quando
indicadas pelo fluxo. O PBM deve apontar para estas mesmas especificações e
preservar suas particularidades de etapa, origem, quantidade e validação.

#### `Pharma_checkPricesAndRules` — query

**Descrição:** consulta preços e regras do programa para os produtos.

**Pré-requisitos:** token; origem; CNPJ; identificação do consumidor; lista de
produtos.

**Observação:** `customerCode` é descrito como cartão Benefits ou CPF Pharma.
Dados de receita são condicionais conforme a regra do produto/programa.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `origin` | `Pharma_AuthorizationOrigin!` | Sim | Origem da solicitação. |
| `storeCode` | `String!` | Sim | CNPJ do estabelecimento. |
| `customerCode` | `String!` | Sim | Cartão Benefits ou CPF Pharma. |
| `products` | `[Pharma_ItemArgs!]!` | Sim | Produtos que serão validados. |
| `products[].ean` | `String!` | Sim | EAN do produto. |
| `products[].price` | `Float!` | Sim | Preço informado. |
| `products[].saleAmount` | `Int!` | Sim | Quantidade da venda. |
| `products[].medicalPrescription` | `Pharma_PrescriptionInput` | Não | Receita, quando aplicável. |

**Campos da resposta (`Pharma_Authorization`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `aproved` | `Boolean!` | Sim | Aprovação, com grafia publicada no schema. |
| `createdAt` | `DateTime!` | Sim | Data/hora local da transação. |
| `totalValue` | `Float!` | Sim | Valor total. |
| `moneyPaidValue` | `Float!` | Sim | Valor a pagar no PDV. |
| `cardPaidValue` | `Float!` | Sim | Valor debitado no cartão Funcional. |
| `totalValueMaxConsumerPrice` | `Float!` | Sim | Total pelo preço máximo ao consumidor. |
| `totalValueWithPrescription` | `Float!` | Sim | Total de itens com receita. |
| `totalValueWithoutPrescription` | `Float!` | Sim | Total de itens sem receita. |
| `totalDiscountAmount` | `Float!` | Sim | Desconto total. |
| `products` | `[Pharma_AuthorizationItem!]!` | Sim | Resultado por item, preço, quantidade e status. |
| `requiredUploadWithPrescription` | `Boolean!` | Sim | Indica necessidade de anexar receita. |

**Exemplo GraphQL**

```graphql
query Pharma_checkPricesAndRules(
  $origin: Pharma_AuthorizationOrigin!,
  $storeCode: String!,
  $customerCode: String!,
  $products: [Pharma_ItemArgs!]!
) {
  Pharma_checkPricesAndRules(
    origin: $origin, storeCode: $storeCode,
    customerCode: $customerCode, products: $products
  ) {
    aproved
    createdAt
    totalValue
    moneyPaidValue
    cardPaidValue
    totalValueMaxConsumerPrice
    totalValueWithPrescription
    totalValueWithoutPrescription
    totalDiscountAmount
    products { ...Pharma_AuthorizationItemFragment }
    requiredUploadWithPrescription
  }
}
```

#### `Sales_preAuthorizeSale` — mutation

**Descrição:** avalia regras do programa e emite autorização de compra.

**Pré-requisitos:** validar produtos e dados aplicáveis; informar consumidor,
estabelecimento e produtos.

**Observação:** `origin` e `channel` são opcionais no schema, mas as jornadas
definem valores conforme origem e canal, por exemplo `POINT_OF_SALES` ou
`PARTNERS_ECOMMERCE`. Enviar os valores exigidos pelo processo e validar com o
responsável a diferença entre obrigatoriedade operacional e nulabilidade do
schema. Se houver itens recusados e aprovados, seguir a regra do fluxo para
reenviar somente os recusados.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `origin` | `Sales_AuthorizationOriginEnum` | Não | Origem da solicitação. |
| `channel` | `Sales_TransactionTypeEnum` | Não | Canal Benefits ou Pharma. |
| `storeCode` | `String!` | Sim | CNPJ do estabelecimento. |
| `customerCode` | `String!` | Sim | Cartão Benefits ou CPF Pharma. |
| `products` | `[Sales_ProductInput!]!` | Sim | Produtos e dados da venda. |
| `products[].ean` | `String!` | Sim | EAN13 do produto. |
| `products[].unitPrice` | `Float!` | Sim | Preço unitário. |
| `products[].maxConsumerPrice` | `Float` | Não | Preço máximo ao consumidor. |
| `products[].quantity` | `Int!` | Sim | Quantidade solicitada. |
| `products[].medicalPrescription` | `Sales_MedicalPrescriptionInput` | Não | Receita, quando necessária. |

**Campos da resposta (`Sales_Authorization`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `createdAt` | `DateTime` | Não | Data/hora local. |
| `authorizationID` | `ID` | Não | ID da autorização. |
| `sequenceID` | `ID` | Não | Sequencial da autorização. |
| `totalValue` | `Float` | Não | Valor total. |
| `moneyPaidValue` | `Float` | Não | Valor a pagar no PDV. |
| `cardPaidValue` | `Float` | Não | Valor debitado no cartão. |
| `cardBalance` | `Float` | Não | Saldo disponível. |
| `products` | `[Sales_Product]` | Não | Resultado por produto. |
| `status` | `Sales_TransactionStatusEnum` | Não | Status da transação. |
| `statusCode` | `Int` | Não | Código de retorno. |
| `statusMessage` | `String` | Não | Mensagem do autorizador. |
| `receipt` | `String` | Não | Comprovante para impressão. |
| `secondFactorAuthentication` | `Sales_SecondFactorAuthenticationType` | Não | Tipo de autenticação em dois fatores. |
| `reimbursementValue` | `Float` | Não | Valor de ressarcimento. |
| `origin` | `Sales_AuthorizationOriginEnum` | Não | Origem aplicada. |

**Exemplo GraphQL**

```graphql
mutation Sales_preAuthorizeSale(
  $origin: Sales_AuthorizationOriginEnum,
  $channel: Sales_TransactionTypeEnum,
  $storeCode: String!,
  $customerCode: String!,
  $products: [Sales_ProductInput!]!
) {
  Sales_preAuthorizeSale(
    origin: $origin, channel: $channel, storeCode: $storeCode,
    customerCode: $customerCode, products: $products
  ) {
    createdAt
    authorizationID
    sequenceID
    totalValue
    moneyPaidValue
    cardPaidValue
    cardBalance
    products { ...Sales_ProductFragment }
    status
    statusCode
    statusMessage
    receipt
    secondFactorAuthentication
    reimbursementValue
    origin
  }
}
```

#### `Prescription_addPrescription` — mutation

**Descrição:** cria registro de receita e retorna seus metadados.

**Pré-requisitos:** executar quando a regra de preço indicar necessidade de
receita; obter arquivo ou URL e metadados necessários.

**Observação:** `source` aceita `file` ou `url`; se ambos forem enviados,
`file` tem precedência. A documentação do fluxo descreve multipart com
`operations`, `map` e `uploaded_file`, com limite de 2 MB. A referência
GraphQL não detalha os campos internos de `Prescription_Upload`.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `source` | `Prescription_PrescriptionSourceInput!` | Sim | Arquivo ou URL de origem. |
| `source.file` | `Prescription_Upload` | Não | Arquivo multipart. |
| `source.url` | `URL` | Não | URL do arquivo. |
| `uploadInfo` | `Prescription_UploadInfo!` | Sim | Metadados da receita. |
| `uploadInfo.cardNumber` | `String!` | Sim | Cartão associado. |
| `uploadInfo.cpf` | `String` | Não | CPF. |
| `uploadInfo.source` | `Prescription_Source!` | Sim | Origem do arquivo. |
| `uploadInfo.mime` | `String` | Não | Tipo MIME. |
| `uploadInfo.prescriptionName` | `String` | Não | Nome da receita. |
| `uploadInfo.dateIssuance` | `DateTime` | Não | Data de emissão. |

**Campos da resposta (`Prescription_Prescription`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `id` | `ID!` | Sim | Identificador da receita. |
| `uploadedAt` | `DateTime!` | Sim | Data/hora do upload. |
| `deletedAt` | `DateTime` | Não | Data/hora de exclusão. |
| `expiresAt` | `DateTime` | Não | Data/hora de expiração. |
| `source` | `Prescription_Source!` | Sim | Origem do documento. |
| `file` | `JSON` | Não | Campo de arquivo; sem descrição adicional no schema. |
| `name` | `String` | Não | Sem descrição adicional na referência. |
| `cardNumber` | `String` | Não | Cartão associado. |
| `identity` | `String` | Não | Sem descrição adicional na referência. |
| `status` | `Prescription_Status` | Não | Status do documento. |
| `storage` | `String` | Não | Sem descrição adicional na referência. |
| `originalName` | `String` | Não | Nome original. |
| `extension` | `String` | Não | Extensão do arquivo. |
| `prescriptionName` | `String` | Não | Nome da receita. |
| `dateIssuance` | `String` | Não | Data de emissão. |

**Exemplo GraphQL**

```graphql
mutation Prescription_addPrescription(
  $source: Prescription_PrescriptionSourceInput!,
  $uploadInfo: Prescription_UploadInfo!
) {
  Prescription_addPrescription(source: $source, uploadInfo: $uploadInfo) {
    id
    uploadedAt
    deletedAt
    expiresAt
    source
    file
    name
    cardNumber
    identity
    status
    storage
    originalName
    extension
    prescriptionName
    dateIssuance
  }
}
```

#### `Prescription_bindPrescription` — mutation

**Descrição:** associa receitas à transação.

**Pré-requisitos:** executar `Prescription_addPrescription` e usar os IDs
retornados junto dos dados da transação.

**Observação:** a resposta é `Boolean!`. Preservar o valor e tratar `false`
como vínculo não confirmado.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `prescriptionIDs` | `[ID!]!` | Sim | IDs das receitas. |
| `transaction` | `Prescription_TransactionInput!` | Sim | Chave da transação. |
| `transaction.authorization` | `Int!` | Sim | Número da autorização. |
| `transaction.sequence` | `Int!` | Sim | Sequencial. |
| `transaction.timestamp` | `DateTime!` | Sim | Data/hora da transação. |

**Campos da resposta**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| retorno da mutation | `Boolean!` | Sim | Indica se o vínculo foi realizado. |

**Exemplo GraphQL**

```graphql
mutation Prescription_bindPrescription(
  $prescriptionIDs: [ID!]!,
  $transaction: Prescription_TransactionInput!
) {
  Prescription_bindPrescription(
    prescriptionIDs: $prescriptionIDs, transaction: $transaction
  )
}
```

#### `Sales_transaction` — query

**Descrição:** consulta uma pré-autorização.

**Pré-requisitos:** CNPJ, `authorizationID` e canal; para PBM 2.0, fornecer
`customerCode`.

**Observação:** `createdAt` só precisa ser enviado para finalização de
pré-autorização que não foi feita no mesmo dia. `channel` e `customerCode` são
opcionais no schema, mas podem ser necessários pelo processo.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `channel` | `Sales_TransactionTypeEnum` | Não | Canal Benefits ou Pharma. |
| `storeCode` | `String!` | Sim | CNPJ do estabelecimento. |
| `customerCode` | `String` | Não | Cartão ou CPF; requerido na consulta PBM 2.0. |
| `authorizationID` | `ID!` | Sim | Número da autorização. |
| `createdAt` | `DateTime` | Não | Data da transação para operações de outro dia. |

**Campos da resposta (`Sales_Transaction`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `createdAt` | `DateTime` | Não | Data/hora local. |
| `authorizationID` | `ID` | Não | ID da autorização. |
| `sequenceID` | `ID` | Não | Sequencial. |
| `totalValue` | `Float` | Não | Valor total. |
| `moneyPaidValue` | `Float` | Não | Valor a pagar no PDV. |
| `cardPaidValue` | `Float` | Não | Valor do cartão. |
| `products` | `[Sales_Product]` | Não | Itens e status individuais. |
| `status` | `Sales_TransactionStatusEnum` | Não | Status da transação. |
| `statusCode` | `Int` | Não | Código de retorno. |
| `statusMessage` | `String` | Não | Mensagem do autorizador. |

**Exemplo GraphQL**

```graphql
query Sales_transaction(
  $channel: Sales_TransactionTypeEnum,
  $storeCode: String!,
  $customerCode: String,
  $authorizationID: ID!,
  $createdAt: DateTime
) {
  Sales_transaction(
    channel: $channel, storeCode: $storeCode, customerCode: $customerCode,
    authorizationID: $authorizationID, createdAt: $createdAt
  ) {
    createdAt
    authorizationID
    sequenceID
    totalValue
    moneyPaidValue
    cardPaidValue
    products { ...Sales_ProductFragment }
    status
    statusCode
    statusMessage
  }
}
```

#### `Sales_confirmPreAuthorizedSale` — mutation

**Descrição:** efetua venda recuperando as regras de uma pré-autorização válida.

**Pré-requisitos:** ter uma pré-autorização válida; reutilizar seu
`authorizationID` e os produtos autorizados.

**Observação:** `customerCode` é marcado como deprecated/não necessário.
`preAuthorizationDate` é opcional no schema, mas deve ser informado para
finalização fora do mesmo dia. Não adicionar itens nem exceder quantidades
autorizadas conforme o fluxo aprovado.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `origin` | `Sales_AuthorizationOriginEnum` | Não | Origem da solicitação. |
| `channel` | `Sales_TransactionTypeEnum` | Não | Canal Benefits ou Pharma. |
| `authorizationID` | `ID!` | Sim | Identificador da pré-autorização. |
| `storeCode` | `String!` | Sim | CNPJ do estabelecimento. |
| `customerCode` | `String` | Não | Deprecated; a referência diz que não é necessário. |
| `invoiceCode` | `String` | Não | Chave da NF-e. |
| `invoiceAuthProtocol` | `String` | Não | Protocolo de autenticação da NF-e. |
| `products` | `[Sales_ProductInput!]!` | Sim | Produtos da venda finalizada. |
| `preAuthorizationDate` | `DateTime` | Não | Data/hora local da pré-autorização. |

**Campos da resposta:** mesmo tipo `Sales_Authorization` de
`Sales_preAuthorizeSale`; campos e nulabilidade são os mesmos.

**Exemplo GraphQL**

```graphql
mutation Sales_confirmPreAuthorizedSale(
  $origin: Sales_AuthorizationOriginEnum,
  $channel: Sales_TransactionTypeEnum,
  $authorizationID: ID!,
  $storeCode: String!,
  $customerCode: String,
  $invoiceCode: String,
  $invoiceAuthProtocol: String,
  $products: [Sales_ProductInput!]!,
  $preAuthorizationDate: DateTime
) {
  Sales_confirmPreAuthorizedSale(
    origin: $origin, channel: $channel, authorizationID: $authorizationID,
    storeCode: $storeCode, customerCode: $customerCode,
    invoiceCode: $invoiceCode, invoiceAuthProtocol: $invoiceAuthProtocol,
    products: $products, preAuthorizationDate: $preAuthorizationDate
  ) {
    createdAt
    authorizationID
    sequenceID
    totalValue
    moneyPaidValue
    cardPaidValue
    cardBalance
    products { ...Sales_ProductFragment }
    status
    statusCode
    statusMessage
    receipt
    secondFactorAuthentication
    reimbursementValue
    origin
  }
}
```

#### `Pharma_displayProductDiscountRules` — query

**Descrição:** consulta regras de desconto do produto para exibição em uma
interface.

**Pré-requisitos:** CNPJ e EAN; CPF, origem e detalhamento são opcionais no
schema.

**Observação:** a descrição do argumento `detailed` é “Consulta resumida”, sem
explicar o significado de `true` ou `false`. Validar esse comportamento antes
de criar um controle de interface.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `storeCode` | `String!` | Sim | CNPJ do estabelecimento. |
| `productEan` | `String!` | Sim | EAN do produto. |
| `customerCode` | `String` | Não | CPF do paciente. |
| `origin` | `Pharma_AuthorizationOrigin` | Não | Origem da solicitação. |
| `detailed` | `Boolean` | Não | Consulta resumida; direção do flag não esclarecida. |

**Campos da resposta (`[Pharma_DisplayProductDiscountRules!]`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `status` | `String!` | Sim | Status da solicitação. |
| `statusMessage` | `String` | Não | Descrição do status. |
| `products` | `[Pharma_PharmaProduct!]!` | Sim | Nome, apresentação e EANs dos produtos. |
| `messages` | `[String!]!` | Sim | Mensagens para a interface. |
| `nameProgram` | `String` | Não | Nome do programa. |
| `priority` | `Float` | Não | Prioridade do programa. |
| `discounts` | `[Pharma_PurchaseDiscount!]!` | Sim | Descontos, valores e condições. |

**Exemplo GraphQL**

```graphql
query Pharma_displayProductDiscountRules(
  $storeCode: String!,
  $productEan: String!,
  $customerCode: String,
  $origin: Pharma_AuthorizationOrigin,
  $detailed: Boolean
) {
  Pharma_displayProductDiscountRules(
    storeCode: $storeCode, productEan: $productEan,
    customerCode: $customerCode, origin: $origin, detailed: $detailed
  ) {
    status
    statusMessage
    products { ...Pharma_PharmaProductFragment }
    messages
    nameProgram
    priority
    discounts { ...Pharma_PurchaseDiscountFragment }
  }
}
```

#### `Sales_customerMemberships` — query

**Descrição:** consulta dados do beneficiário e os programas associados.

**Pré-requisitos:** código do consumidor; informar canal quando necessário
para distinguir Benefits de Pharma.

**Observação:** `channel` é opcional no schema. `customer` contém código e
nome; cada `membership` pode conter programa, tipo, descrição e mensagem da
venda.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `channel` | `Sales_TransactionTypeEnum` | Não | Canal Benefits ou Pharma. |
| `customerCode` | `String!` | Sim | Cartão Benefits ou CPF Pharma. |

**Campos da resposta (`Sales_CustomerMembershipInfo`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `customer` | `Sales_Customer` | Não | Consumidor: `code` e `name`. |
| `memberships` | `[Sales_Membership]` | Não | Programas do cliente. |
| `memberships[].id` | `ID` | Não | Código do programa. |
| `memberships[].name` | `String` | Não | Nome do programa. |
| `memberships[].type` | `Sales_ProgramTypeEnum` | Não | Tipo do programa. |
| `memberships[].description` | `String` | Não | Descrição. |
| `memberships[].salingMessage` | `String` | Não | Mensagem para venda, conforme grafia do schema. |

**Exemplo GraphQL**

```graphql
query Sales_customerMemberships(
  $channel: Sales_TransactionTypeEnum,
  $customerCode: String!
) {
  Sales_customerMemberships(channel: $channel, customerCode: $customerCode) {
    customer { ...Sales_CustomerFragment }
    memberships { ...Sales_MembershipFragment }
  }
}
```

#### `Sales_updateInvoiceCode` — mutation

**Descrição:** salva/atualiza o código da NF-e da venda.

**Pré-requisitos:** autorização de venda e data da venda.

**Observação:** `authorizationID` e `saleDate` são obrigatórios no schema;
`invoiceCode` e `invoiceAuthProtocol` são opcionais. Confirmar se o processo
fiscal exige os dois campos antes de omiti-los.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `origin` | `Sales_AuthorizationOriginEnum` | Não | Origem da solicitação. |
| `storeCode` | `String!` | Sim | CNPJ do estabelecimento. |
| `invoiceCode` | `String` | Não | Chave da NF-e. |
| `invoiceAuthProtocol` | `String` | Não | Protocolo de autenticação da NF-e. |
| `authorizationID` | `ID!` | Sim | Identificador gerado pelo autorizador. |
| `saleDate` | `DateTime!` | Sim | Data da venda. |

**Campos da resposta (`Sales_UpdatedInvoiceCode`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `status` | `Sales_TransactionStatusEnum` | Não | Status. |
| `statusCode` | `Int` | Não | Código do status. |
| `statusMessage` | `String` | Não | Mensagem do autorizador. |

**Exemplo GraphQL**

```graphql
mutation Sales_updateInvoiceCode(
  $origin: Sales_AuthorizationOriginEnum,
  $storeCode: String!,
  $invoiceCode: String,
  $invoiceAuthProtocol: String,
  $authorizationID: ID!,
  $saleDate: DateTime!
) {
  Sales_updateInvoiceCode(
    origin: $origin, storeCode: $storeCode, invoiceCode: $invoiceCode,
    invoiceAuthProtocol: $invoiceAuthProtocol,
    authorizationID: $authorizationID, saleDate: $saleDate
  ) {
    status
    statusCode
    statusMessage
  }
}
```

#### `Pharma_discountPrograms` — query

**Descrição:** consulta base de programas da indústria e produtos por CNPJ.

**Pré-requisitos:** CNPJ do estabelecimento; origem opcional.

**Observação:** a Jornada de Venda registra atualização diária da carga.
Preservar `allowedOrigins` e as regras por produto, incluindo preço máximo,
descontos, bloqueio e exigência/retenção de receita.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `storeCode` | `String!` | Sim | CNPJ do estabelecimento. |
| `origin` | `Pharma_AuthorizationOrigin` | Não | Origem da solicitação. |

**Campos da resposta (`[Pharma_PharmaProgram!]!`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `id` | `ID!` | Sim | Código do programa. |
| `name` | `String!` | Sim | Nome do programa. |
| `url` | `String` | Não | URL do programa. |
| `allowedOrigins` | `[Int!]!` | Sim | Códigos das origens permitidas. |
| `rules` | `[Pharma_PharmaProgramRule!]!` | Sim | Regras dos produtos. |
| `rules[].id` | `ID!` | Sim | Código da regra do produto. |
| `rules[].description` | `ID` | Não | Código/descrição da regra, conforme schema. |
| `rules[].product` | `Pharma_PharmaProduct!` | Sim | Nome, embalagem e EANs do produto. |
| `rules[].maximumConsumerPrice` | `Float!` | Sim | Preço máximo ao consumidor. |
| `rules[].saleBaseDiscountPercentage` | `Float!` | Sim | Desconto base da venda. |
| `rules[].repositionBaseDiscountPercentage` | `Float!` | Sim | Desconto base da reposição. |
| `rules[].blocked` | `Boolean!` | Sim | Indica bloqueio no PDV. |
| `rules[].requiresMedicalPrescription` | `Boolean!` | Sim | Indica necessidade de receita. |
| `rules[].witholdsMedicalPrescription` | `Boolean!` | Sim | Indica retenção da receita. |

**Exemplo GraphQL**

```graphql
query Pharma_discountPrograms(
  $storeCode: String!,
  $origin: Pharma_AuthorizationOrigin
) {
  Pharma_discountPrograms(storeCode: $storeCode, origin: $origin) {
    id
    name
    url
    allowedOrigins
    rules { ...Pharma_PharmaProgramRuleFragment }
  }
}
```

#### `Sales_cancel` — mutation

**Descrição:** cancela uma venda.

**Pré-requisitos:** CNPJ e identificação da venda ou pré-autorização a cancelar.

**Observação:** somente `storeCode` está marcado como obrigatório no schema;
`authorizationID` e `preAuthorizationID` são opcionais. A Jornada deve
informar o ID correto para a etapa e enviar `createdAt` quando a transação não
for do mesmo dia. O comportamento já documentado para repetição é código `103`
e mensagem `Transacao ja cancelada`.

**Campos da requisição**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `origin` | `Sales_AuthorizationOriginEnum` | Não | Origem. |
| `channel` | `Sales_TransactionTypeEnum` | Não | Canal Benefits ou Pharma. |
| `storeCode` | `String!` | Sim | CNPJ do estabelecimento. |
| `customerCode` | `String` | Não | Cartão Benefits ou CPF Pharma. |
| `authorizationID` | `ID` | Não | ID da venda/autorização. |
| `preAuthorizationID` | `ID` | Não | ID da pré-autorização. |
| `createdAt` | `DateTime` | Não | Data/hora local para transação de outro dia. |

**Campos da resposta (`Sales_CanceledTransaction`)**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `createdAt` | `DateTime` | Não | Data/hora da transação. |
| `authorizationID` | `ID` | Não | ID da autorização. |
| `status` | `Sales_TransactionStatusEnum` | Não | Status. |
| `statusCode` | `Int` | Não | Código de retorno. |
| `statusMessage` | `String` | Não | Mensagem do autorizador. |
| `receipt` | `String` | Não | Comprovante para impressão. |

**Exemplo GraphQL**

```graphql
mutation Sales_cancel(
  $origin: Sales_AuthorizationOriginEnum,
  $channel: Sales_TransactionTypeEnum,
  $storeCode: String!,
  $customerCode: String,
  $authorizationID: ID,
  $preAuthorizationID: ID,
  $createdAt: DateTime
) {
  Sales_cancel(
    origin: $origin, channel: $channel, storeCode: $storeCode,
    customerCode: $customerCode, authorizationID: $authorizationID,
    preAuthorizationID: $preAuthorizationID, createdAt: $createdAt
  ) {
    createdAt
    authorizationID
    status
    statusCode
    statusMessage
    receipt
  }
}
```

### Tipos compostos de requisição e resposta

O marcador `!` indica valor não nulo no schema. Em objetos compostos, essa
mesma obrigatoriedade vale para o campo interno.

#### Formulários dinâmicos

| Tipo | Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---:|---|
| `Pharma_FormField` | `text` | `String!` | Sim | Identificador/nome técnico do campo enviado. |
| `Pharma_FormField` | `value` | `String!` | Sim | Valor preenchido. |
| `Pharma_FormExtraField` | `QuestionCode` | `Float!` | Sim | Código da pergunta. |
| `Pharma_FormExtraField` | `AnswerCode` | `Float!` | Sim | Código da resposta. |
| `Pharma_FormExtraField` | `QuestionTypeFlag` | `Float!` | Sim | Tipo da questão. |
| `Pharma_FormExtraField` | `TypedValue` | `String!` | Sim | Valor digitado. |
| `Pharma_RegistrationPolicyField` | `field` | `String!` | Sim | Identificador usado no envio. |
| `Pharma_RegistrationPolicyField` | `label` | `String!` | Sim | Rótulo exibido. |
| `Pharma_RegistrationPolicyField` | `type` | `Pharma_TypeField!` | Sim | Tipo do campo. |
| `Pharma_RegistrationPolicyField` | `description` | `String` | Não | Descrição de uso. |
| `Pharma_RegistrationPolicyField` | `display` | `Pharma_DisplayField!` | Sim | Regra: `HIDDEN`, `OPTIONAL` ou `REQUIRED`. |
| `Pharma_RegistrationPolicyField` | `entity` | `Pharma_EntityRegister!` | Sim | Entidade à qual o campo se aplica. |
| `Pharma_RegistrationPolicyField` | `defaultValue` | `String` | Não | Valor inicial. |
| `Pharma_RegistrationPolicyField` | `options` | `[Pharma_RegistrationPolicyFieldOption!]!` | Sim | Opções de seleção. |

Os campos de política e formulário são dinâmicos por programa/produto; não
transformá-los em formulário estático comum a todo Credenciado.

#### Produto e receita

| Tipo | Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---:|---|
| `Pharma_ItemArgs` | `ean` | `String!` | Sim | EAN. |
| `Pharma_ItemArgs` | `price` | `Float!` | Sim | Preço informado. |
| `Pharma_ItemArgs` | `saleAmount` | `Int!` | Sim | Quantidade da venda. |
| `Pharma_ItemArgs` | `medicalPrescription` | `Pharma_PrescriptionInput` | Não | Receita. |
| `Pharma_PrescriptionInput` | `quantity` / `date` / `dailyDose` | `Int` / `DateTime` / `Float` | Não | Quantidade prescrita, data e dose diária. |
| `Pharma_PrescriptionInput` | `prescriber` | `Pharma_PrescriberRegisterInput` | Não | Conselho, UF e número de registro. |
| `Sales_ProductInput` | `ean` | `String!` | Sim | EAN13. |
| `Sales_ProductInput` | `unitPrice` | `Float!` | Sim | Preço unitário. |
| `Sales_ProductInput` | `maxConsumerPrice` | `Float` | Não | Preço máximo ao consumidor. |
| `Sales_ProductInput` | `quantity` | `Int!` | Sim | Quantidade solicitada. |
| `Sales_ProductInput` | `medicalPrescription` | `Sales_MedicalPrescriptionInput` | Não | Receita médica. |
| `Sales_MedicalPrescriptionInput` | `date` / `quantity` | `Date!` / `Int!` | Sim | Data e quantidade receitada. |
| `Sales_MedicalPrescriptionInput` | `informaDoseDiaria` | `Boolean` | Não | Obsoleto; não usar em nova integração. |
| `Sales_MedicalPrescriptionInput` | `dailydose` | `Float` | Não | Dose diária. |
| `Sales_MedicalPrescriptionInput` | `prescriber` | `Sales_PrescriberRegisterInput!` | Sim | Registro profissional do prescritor. |
| `Sales_MedicalPrescriptionInput` | `usage` | `Sales_UsageEnum` | Não | Uso contínuo ou ocasional. |
| `Sales_PrescriberRegisterInput` | `council` / `registerNumber` / `stateAbbr` | `Sales_CouncilEnum!` / `Int!` / `String!` | Sim | Conselho, número e UF. |
| `Pharma_PrescriberRegisterInput` | `council` / `stateAbbr` / `registerNumber` | `Pharma_Councils` / `String` / `Int` | Não | Campos da consulta Pharma; nenhum campo interno marcado obrigatório. |

Os enums de conselho divergem: `Pharma_Councils` publica `CRM`, `CRO` e
`CRF`; `Sales_CouncilEnum` publica `CRM` e `CRO`. Não converter
automaticamente de um para o outro.

#### Upload e vínculo da receita

| Tipo | Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---:|---|
| `Prescription_PrescriptionSourceInput` | `file` | `Prescription_Upload` | Não | Arquivo multipart. |
| `Prescription_PrescriptionSourceInput` | `url` | `URL` | Não | URL da receita. |
| `Prescription_UploadInfo` | `cardNumber` | `String!` | Sim | Cartão associado. |
| `Prescription_UploadInfo` | `cpf` | `String` | Não | CPF. |
| `Prescription_UploadInfo` | `source` | `Prescription_Source!` | Sim | Origem do arquivo. |
| `Prescription_UploadInfo` | `mime` / `prescriptionName` | `String` / `String` | Não | MIME e nome da receita. |
| `Prescription_UploadInfo` | `dateIssuance` | `DateTime` | Não | Data de emissão. |
| `Prescription_TransactionInput` | `authorization` / `sequence` / `timestamp` | `Int!` / `Int!` / `DateTime!` | Sim | Autorização, sequencial e data/hora. |

A descrição de `Prescription_PrescriptionSourceInput` exige arquivo ou URL; se
ambos forem informados, arquivo tem precedência. A referência de tipo não
expressa a exclusividade como validação GraphQL, então a regra deve permanecer
documentada na Jornada.

#### Respostas aninhadas relevantes

| Tipo | Campos retornados | Significado |
|---|---|---|
| `Pharma_EligibilityAssessment` | `belongsToIndustryProgram: Boolean!`, `programDescription: String`, `programCode: ID`, `productDescription: String` | Elegibilidade e identificação do programa/produto. |
| `Pharma_RegistrationPolicy` | `allowDependents`, `dependentsLimit`, `requiresBeneficiaryRegistration`, `requiresMedicalPrescriptionRegistration`, `requiresAtLeastOneContactMedium`, `requiresMedicalPrescriber`, campos cadastrais, `allowedOrigins`, `isRegistered`, `originPermitedRegister`, `urlRegisterSite` | Política dinâmica de cadastro. Preservar os tipos e nulabilidade do schema. |
| `Pharma_Dependent` | `id: ID!`, `name: String!`, `birth: DateTime!`, `gender: String!`, `holder: Boolean!` | Paciente associado ao beneficiário. |
| `Pharma_AuthorizationItem` | `transactionType`, `ean`, `description`, `maximumConsumerPrice`, `priceReceived`, `funcionalPrice`, `salePrice`, `saleAmount`, `medicalPrescription`, `status` | Resultado de preço/regra por item. |
| `Sales_Product` | `ean`, `description`, `maxConsumerPrice`, `unitPrice`, `quantity`, `medicalPrescription`, `status`, `statusCode`, `statusMessage`, `reimbursementValue`, `storePlan`, `clientCode`, `totalValue`, `moneyPaidValue`, `cardPaidValue` | Resultado por item de uma autorização/transação. |
| `Pharma_PharmaProduct` | `name: String!`, `package: String!`, `eans: [String!]!` | Produto retornado em consulta de regras. |
| `Pharma_PurchaseDiscount` | `type: String!`, `category`, `quantity`, `originalAmount`, `discountPercentage`, `savedAmount`, `amount`, condições e produtos vinculados | Valores, economia e condições de desconto. |

### Tabelas de referência GraphQL

| Enum/tabela | Valores publicados | Uso |
|---|---|---|
| `Sales_TransactionTypeEnum` | `BENEFITS`, `PHARMA` | Canal. |
| `Pharma_RequestStatus` | `SUCCESS`, `ERROR` | Resultado de validação Pharma. |
| `Sales_TransactionStatusEnum` | `SUCCESS`, `ERROR` | Status de transação Sales. |
| `Pharma_Councils` | `CRM`, `CRO`, `CRF` | Conselho na entrada Pharma. |
| `Sales_CouncilEnum` | `CRM`, `CRO` | Conselho em receita Sales. |
| `Prescription_Status` | `ACTIVE`, `INACTIVE`, `REMOVED`, `UNKNOWN` | Status da receita. |

Origens de `Pharma_AuthorizationOrigin`:

```text
DTS, MOBILE_APP, POINT_OF_SALES, CALL_CENTER, INDUSTRY_PROGRAM_WEBSITE,
INTERACTIVE_VOICE_RESPONSE, VACCINES_INDUSTRY_PROGRAM_WEBSITE, PURCHASE,
AZIMUTE, PARTNERS_ECOMMERCE, MANAGER_SYSTEM, FACEBOOK,
ELECTRONIC_PRESCRIPTION, CCUCO, BCARE, NEXODATA, CONSULTA_REMEDIO, MEMED,
FARMACIAS_APP, PEDBOT, IFOOD
```

Origens de `Sales_AuthorizationOriginEnum`:

```text
DTS, MOBILE_APP, POINT_OF_SALES, CALL_CENTER, INDUSTRY_PROGRAM_WEBSITE,
INTERACTIVE_VOICE_RESPONSE, VACCINES_INDUSTRY_PROGRAM_WEBSITE, PURCHASE,
AZIMUTE, PARTNERS_ECOMMERCE, MANAGER_SYSTEM, FACEBOOK,
ELECTRONIC_PRESCRIPTION, CCUCO, BCARE, CONSULTA_REMEDIO, MEMED,
FARMACIAS_APP, PEDBOT, DELIVERY, IFOOD, BF
```

Origens de `Prescription_Source`:

```text
MOBILE_APP, WEB_APP, PORTAL_GESTOR, PLANT, DTS, POINT_OF_SALES, CALL_CENTER,
INDUSTRY_PROGRAM_WEBSITE, INTERACTIVE_VOICE_RESPONSE,
VACCINES_INDUSTRY_PROGRAM_WEBSITE, PURCHASE, AZIMUTE, PARTNERS_ECOMMERCE,
MANAGER_SYSTEM, FACEBOOK, ELECTRONIC_PRESCRIPTION, CCUCO, BCARE,
CONSULTA_REMEDIO, MEMED, FARMACIAS_APP, PEDBOT, DELIVERY, UNKNOWN
```

Os enums de origem não são idênticos. A tabela de origem dos mapas do Credenciado
(Ecommerce, Mobile App, Point of Sale, Call Center, Todas Marketplaces, Mevo e
iFood) deve permanecer separada até validar sua correspondência com os códigos.

### Divergências da referência que exigem validação

| Ponto | Tratamento |
|---|---|
| Campos `origin` e `channel` aparecem opcionais no schema de algumas operações, mas as jornadas determinam valores por cenário. | Enviar os valores do fluxo aprovado e validar a diferença de nulabilidade com o responsável. |
| Inputs de Opt-in declaram `Origem: Float!` e as operações também recebem `origin` enum. | Não inventar conversão numérica; solicitar tabela oficial. |
| `Pharma_verifyOptIn` retorna flags como `String`. | Preservar o tipo e validar os valores antes de tratá-los como booleanos. |
| `Pharma_sendOptInTerms` descreve SMS e/ou e-mail, mas ambos os contatos estão `String!`. | Confirmar se ambos são obrigatórios ou se há envio por um canal. |
| `Pharma_displayProductDiscountRules.detailed` é descrito como “Consulta resumida”. | Confirmar o comportamento de `true` e `false`. |
| `Sales_cancel` não marca os IDs de cancelamento como obrigatórios. | A Jornada informa qual ID enviar para venda ou pré-autorização. |
| `Sales_confirmPreAuthorizedSale.customerCode` está deprecated/não necessário. | Não tratá-lo como obrigatório; confirmar exceções por ambiente. |
| `createToken` não aparece na lista de operações consultada. | Manter o contrato ligado à documentação própria de autenticação. |

### Cobertura desta complementação

- Cadastro: `Pharma_assessEligibility`,
  `Pharma_signUpProgramBeneficiary`,
  `Pharma_signUpProgramBeneficiaryDependent`,
  `Pharma_addProgramBeneficiaryToProduct` e `Pharma_prescriber`.
- Opt-in: `Pharma_verifyOptIn`, `Pharma_sendOptInTerms`,
  `Pharma_retrieveTextTermsOptIn` e `Pharma_insertOptIn`.
- Venda e PBM no Caixa: `Pharma_checkPricesAndRules`,
  `Sales_preAuthorizeSale`, `Prescription_addPrescription`,
  `Prescription_bindPrescription`, `Sales_transaction`,
  `Sales_confirmPreAuthorizedSale`,
  `Pharma_displayProductDiscountRules`, `Sales_customerMemberships`,
  `Sales_updateInvoiceCode`, `Pharma_discountPrograms` e `Sales_cancel`.

Os fragmentos `...Fragment` correspondem aos nomes da API Reference; ao tornar
um exemplo executável, incluir as definições dos fragmentos da própria
referência.
