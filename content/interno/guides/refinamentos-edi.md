# Refinamentos e rastreamento — Portal EDI

Área interna para acompanhar refinamentos de produto, decisões de experiência,
cronograma, critérios de validação e próximos passos do portal EDI.

Use este índice para localizar o registro da atividade e o ponto atual de cada
frente. O acesso é restrito ao ambiente interno do time EDI em `/interno`.

## Documentos de acompanhamento

- [EDI-14331 — Jornada e Roteiro de Integração](/interno/edi-14331-jornada-integracao)
- [EDI-14332 — Navegação contextual dentro do subproduto](#edi-14332--navegação-contextual-dentro-do-subproduto)
- [EDI-14333 — Refinamento visual e estrutura inicial do Credenciado](#edi-14333)
- [Cronograma do Portal EDI](/interno/cronograma-portal-edi)
- [Decisões de UI do Portal EDI](/interno/decisoes-ui-portal-edi)
- [Onboarding EDI e atualizações das issues](/interno/onboarding-edi)

## Regra de atualização

Registre aqui ou no documento específico o status atual, as decisões tomadas,
as validações executadas e o próximo passo. Conteúdo técnico de produto deve
ser incluído somente quando houver respaldo da equipe responsável e da
homologação.

## EDI-14331

A estrutura de navegação entre Jornada da Integração e Roteiro de Integração
está implementada. O próximo refinamento é detalhar os fluxos do Trade e
aguardar informações validadas para os demais subprodutos.

## EDI-14321 — revisão do modelo de implementação dos índices

### Objetivo

Adequar o modelo **Modelo Implementação - Portal EDI** à estrutura real do
Canal Autorizador, preparando a documentação para desenvolvimento sem alterar
radicalmente o portal ou reinterpretar o conteúdo aprovado pelo responsável do
subproduto.

Esta etapa é um refinamento técnico e estrutural. A documentação validada pelo
responsável do Canal Autorizador é a fonte oficial para regras, prazos,
endpoints, status, cenários, mensagens e demais orientações.

### Premissas da implementação

- preservar a estrutura atual do portal e seus componentes reutilizáveis;
- manter a navbar como fonte principal de navegação entre as áreas;
- fazer o índice acompanhar a área selecionada na navbar;
- manter separadas Documentação, Jornada, Roteiro, Queries, Mutations e Teste
  de Requisição;
- aplicar o conteúdo aprovado sem criar regras novas ou substituir textos
  validados;
- iniciar o desenvolvimento na branch `edi-14321`, derivada de `homolog`;
- não transportar alterações das issues EDI-14331, EDI-14332, EDI-14333 ou
  EDI-14334.

### Estrutura de navegação a preservar

#### Documentação

- Contexto;
- Segurança e ferramentas;
- referências gerais relacionadas ao subproduto.

O Fluxo Geral do pedido não deve ser criado como uma área paralela de
Documentação. Ele pertence à Jornada da Integração.

#### Jornada da Integração

- Fluxo Geral do pedido;
- Autenticar e obter token;
- Criar pré-pedido;
- Consultar um pedido;
- Enviar retorno do pedido;
- Enviar nota fiscal;
- Cancelar pedido;
- Consultar ressarcimento;
- Substituir nota fiscal;
- Consultar pedidos por filtro;
- Consultar status atualizado;
- Enviar devolução da nota;
- Consultar uma devolução;
- Consultar devoluções paginadas;
- tabelas de referência separadas conforme o DOCX e vinculadas às etapas
  correspondentes.

As tabelas devem aparecer quando a Jornada estiver selecionada. Elas não devem
ser exibidas no índice da Documentação nem funcionar como uma área superior
independente da navbar.

#### Roteiro de Integração

- cenários do Fluxo Normal;
- cenários do Fluxo Order;
- pré-condições e etapas de teste;
- regras de rejeição total e parcial;
- resultado esperado e evidências;
- Fluxograma Individual, quando publicado.

#### Queries e Mutations

Cada área deve exibir somente suas próprias operações e manter links rápidos
para navegação direta.

#### Versão do subproduto

A versão do subproduto e o histórico de alterações devem aparecer na parte final
da documentação, seguindo a estrutura utilizada nos demais produtos. Essa
seção não é uma nova operação da Jornada.

### Inventário original do Word

O inventário abaixo é mantido como referência de origem. A exibição do portal
deve seguir os grupos da navbar, e não uma lista linear única.

| # | Índice de referência |
|---:|---|
| 1 | Contexto |
| 2 | Tabelas de referência |
| 3 | Autenticar e obter token |
| 4 | Criar pré-pedido |
| 5 | Consultar um pedido |
| 6 | Enviar retorno do pedido |
| 7 | Enviar nota fiscal |
| 8 | Cancelar pedido |
| 9 | Consultar ressarcimento |
| 10 | Substituir nota fiscal |
| 11 | Consultar pedidos por filtro |
| 12 | Consultar status atualizado |
| 13 | Enviar devolução da nota |
| 14 | Consultar uma devolução |
| 15 | Consultar devoluções paginadas |

### Decisões por índice

| Índice | Decisão | Aplicação prevista |
|---|---|---|
| Contexto | Adaptar | Reaproveitar a estrutura atual e manter objetivo, escopo e participantes relacionados ao subproduto. |
| Tabelas de referência | Adaptar o schema e vincular por operação | Exibir as separações do DOCX dentro da Jornada, junto das etapas que utilizam cada tabela. |
| Autenticar e obter token | Reaproveitar | Manter `createToken` e o conteúdo aprovado. |
| Criar pré-pedido | Adaptar | Manter `createGroupedOrder`; as regras de rejeição e sua validação serão detalhadas no Roteiro. |
| Consultar um pedido | Reaproveitar | Manter `groupedOrder` e seus vínculos de consulta. |
| Enviar retorno do pedido | Adaptar | Manter `createGroupedResponse` e sua tabela de motivos correspondente. |
| Enviar nota fiscal | Adaptar | Manter `createGroupedInvoice` e o conteúdo aprovado. |
| Cancelar pedido | Adaptar | Manter `createGroupedCancellation` e as pré-condições aprovadas. |
| Consultar ressarcimento | Reaproveitar | Manter `groupedInvoices` na relação com faturamento. |
| Substituir nota fiscal | Reaproveitar | Manter `createGroupedInvoiceReversal` e sua nomenclatura aprovada. |
| Consultar pedidos por filtro | Reaproveitar | Manter `groupedOrders`, filtros e paginação publicados. |
| Consultar status atualizado | Reaproveitar | Manter `groupedStatusChanges` e seus critérios de consumo. |
| Enviar devolução da nota | Adaptar | Manter `createGroupedInvoiceDevolution` e associar a tabela `code_reason`. |
| Consultar uma devolução | Reaproveitar | Manter `groupedInvoiceDevolution`. |
| Consultar devoluções paginadas | Reaproveitar | Manter `groupedInvoiceDevolutions`. |

### Referências por operação

O schema deverá aceitar referências de tabelas por operação, sem criar uma
segunda fonte de dados. Uma operação pode receber as referências definidas no
DOCX e uma mesma tabela poderá ser reutilizada quando fizer parte de mais de
uma etapa.

O vínculo deve seguir o uso aprovado no subproduto, incluindo:

- códigos de indústria e referências do pré-pedido em `createGroupedOrder`;
- status e motivos nas operações de consulta correspondentes;
- motivos do retorno em `createGroupedResponse`;
- `code_reason` em `createGroupedInvoiceDevolution`;
- General Header, Rate Limit e demais orientações transversais na seção de
  Segurança e Consumo da API.

Quando uma tabela estiver vinculada à operação, ela deve ser exibida antes do
exemplo GraphQL correspondente. O bloco global consolidado deixa de ser a
forma principal de navegação depois que as referências forem migradas.

### Redistribuição de conteúdo

- conteúdo de Contexto permanece na Documentação;
- Fluxo Geral do pedido pertence à Jornada;
- regras de rejeição total e parcial pertencem ao Roteiro de Integração;
- status, prazos e demais orientações permanecem na etapa correspondente;
- Fluxograma Individual pertence ao Roteiro;
- informações de segurança permanecem em Segurança e ferramentas;
- referências e responsáveis só devem ser mantidos quando estiverem
  relacionados ao subproduto, ao processo ou à integração;
- não é necessário transportar o nome de quem produziu a documentação.

`Visão geral` e `Pontos importantes` só poderão deixar de ser exibidos depois
que seus conteúdos aprovados estiverem redistribuídos nos destinos corretos.
Essa remoção não autoriza apagar informação nem modificar regra de negócio.

### Versão do subproduto e histórico

O histórico existente em `manual.json.versionHistory` deve ser utilizado como
fonte única. A versão atual e os registros de alteração serão exibidos na parte
final da documentação do subproduto.

Antes de definir a apresentação final, comparar o padrão utilizado no Canal
Autorizador, Credenciado e demais subprodutos. A convenção oficial encontrada
deve ser aplicada de forma consistente no cabeçalho e na seção final, sem
assumir automaticamente se o formato correto é `1.7` ou `1.7.0`.

### Mudanças efetivas

O desenvolvimento deve limitar-se a:

1. filtrar o índice conforme a área selecionada na navbar;
2. manter o Fluxo Geral dentro da Jornada;
3. associar as tabelas às operações no schema;
4. exibir cada tabela na etapa correspondente, incluindo `code_reason` na
   devolução da nota;
5. completar o Roteiro com cenários, rejeições, validações e Fluxograma
   Individual;
6. redistribuir o conteúdo antes de retirar índices antigos;
7. exibir versão e histórico na parte final do subproduto.

Devem ser preservados as rotas, hashes, operações, estrutura de componentes,
conteúdo aprovado e o `flow.json` já existente. Não criar uma nova arquitetura
de documentação.

### Critérios de aceite

- a área selecionada na navbar controla o conteúdo central e o índice;
- Documentação não mostra tabelas da Jornada;
- Jornada mostra o Fluxo Geral, as operações e suas tabelas relacionadas;
- `createGroupedInvoiceDevolution` mostra a tabela `code_reason`;
- Roteiro mostra cenários de teste, regras de rejeição, validações e o
  Fluxograma Individual quando disponível;
- Queries e Mutations mostram somente suas operações;
- versão e histórico aparecem na seção final do subproduto;
- o padrão de versão é igual ao padrão oficial dos demais produtos;
- o conteúdo validado não é reinterpretado;
- índices antigos só são removidos após a redistribuição;
- links, hashes e navegação desktop/mobile continuam funcionando.

### Fora do escopo

- alterar regras de negócio aprovadas;
- alterar endpoints, queries ou mutations existentes;
- criar uma nova arquitetura ou banco de dados para documentação;
- transportar autoria da documentação sem relação com o subproduto;
- criar o Fluxo Order sem fonte validada;
- misturar alterações de outras issues;
- publicar conteúdo novo sem seguir a documentação validada.

### Prompt para o desenvolvimento da EDI-14321

> Leia integralmente o arquivo `content/interno/guides/refinamentos-edi.md`,
> especialmente a seção **EDI-14321 — revisão do modelo de implementação dos
> índices**, antes de alterar qualquer arquivo. Use a documentação validada pelo
> responsável do Canal Autorizador como fonte oficial.
>
> Trabalhe na branch `edi-14321`, derivada de `homolog`. Não utilize como base
> as branches EDI-14331, EDI-14332, EDI-14333 ou EDI-14334 e não transporte
> alterações dessas issues.
>
> Reaproveite a estrutura atual do portal. Faça a navbar controlar o conteúdo
> e o índice da área selecionada. Mantenha Documentação, Jornada, Roteiro,
> Queries, Mutations e Teste de Requisição separados. Apresente o Fluxo Geral
> dentro da Jornada e o Fluxograma Individual dentro do Roteiro quando houver
> conteúdo publicado.
>
> Faça o schema aceitar referências de tabelas por operação. Aplique as
> separações do DOCX quando a Jornada estiver selecionada e renderize cada
> tabela antes do exemplo GraphQL da operação correspondente. Inclua a tabela
> `code_reason` em `createGroupedInvoiceDevolution`. Remova o bloco global apenas
> depois da redistribuição das referências.
>
> Complete o Roteiro com os cenários aprovados, incluindo regras de rejeição,
> pré-condições, resultado esperado e evidências. Redistribua `Visão geral` e
> `Pontos importantes` antes de retirar esses índices. Não altere nem
> reinterprete o conteúdo validado.
>
> Exiba a versão do subproduto e o histórico de `manual.json.versionHistory` na
> parte final da documentação. Compare o padrão de versão dos demais produtos
> antes de decidir entre `1.7` e `1.7.0`. Preserve rotas, hashes, operações,
> links e comportamento responsivo.
>
> Execute a validação desktop/mobile e os testes existentes. Entregue o menor
> diff compatível com a estrutura atual, sem criar arquitetura paralela ou
> transportar alterações de outras issues.

## EDI-14332 — navegação contextual dentro do subproduto

### Objetivo

Melhorar a navegação do fornecedor quando ele estiver dentro de um subproduto,
fazendo com que a área selecionada na navbar controle tanto o conteúdo exibido
quanto o índice de navegação rápida da página.

### Problema atual

O subproduto já possui navegação para Documentação, Jornada da Integração,
Roteiro de Integração, Queries, Mutations e Teste de Requisição. Porém, o
índice lateral ainda pode apresentar atalhos de outras áreas enquanto uma área
diferente está selecionada. Isso duplica a navbar, mistura contextos e obriga
o fornecedor a interpretar se o conteúdo exibido pertence à opção escolhida.

### Comportamento esperado

- **Documentação:** exibir somente o contexto ou visão geral do subproduto.
- **Jornada da Integração:** exibir a jornada completa, seus passos e as
  tabelas de referência ao final do índice.
- **Roteiro de Integração:** exibir somente o roteiro técnico e seus conteúdos
  relacionados, adicionar dentro: **Fluxograma Individual** aplicar o fluxograma individual do subproduto.
- **Queries:** exibir a lista de queries disponíveis e um índice rápido das
  operações para navegação direta.
- **Mutations:** exibir a lista de mutations disponíveis e um índice rápido
  das operações para navegação direta.
- **Métodos:** seguir a mesma regra das operações REST, quando existirem.
- **Teste de Requisição:** exibir somente o conteúdo do teste selecionado.

O índice deve acompanhar a seleção ativa da navbar. Ele não deve repetir como
atalhos os itens que já estão disponíveis na navegação principal nem exibir
seções pertencentes a outra área.

### Regras de navegação

1. A navbar é a fonte principal para alternar entre as áreas do subproduto.
2. O conteúdo central deve corresponder exclusivamente à área selecionada.
3. O índice deve ser derivado da área selecionada e não de todo o manual.
4. As tabelas de referência não devem aparecer no índice de Documentação.
5. As tabelas de referência devem aparecer no índice da Jornada da Integração,
   posicionadas depois dos passos da jornada.
6. Queries, mutations e métodos devem possuir índices próprios quando houver
   mais de uma operação disponível.
7. A seleção ativa, os hashes e os links existentes devem continuar
   funcionando após a navegação entre áreas.
8. A mesma regra deve funcionar no desktop e na navegação mobile.

### Critérios de aceite

- A opção ativa na navbar corresponde ao conteúdo mostrado no centro da tela.
- O índice lateral não apresenta atalhos de áreas que não estão selecionadas.
- Documentação mostra apenas o contexto ou visão geral do subproduto.
- Jornada da Integração mostra seus passos e deixa as tabelas de referência
  por último no índice.
- Roteiro de Integração não repete o índice da Jornada da Integração.
- Queries e Mutations exibem índices com links para suas respectivas
  operações.
- A navegação direta para uma query, mutation ou método mantém a área correta
  selecionada.
- Não são exibidos links quebrados ou conteúdo fictício para áreas sem
  documentação publicada.
- Âncoras antigas continuam válidas ou possuem transição compatível.

### Orientação técnica para implementação

O ajuste deve ser feito no ponto compartilhado da navegação de subprodutos,
reutilizando a seleção de rota já existente. O índice deve ser filtrado pela
área ativa antes de ser renderizado, em vez de receber a lista completa de
seções do manual para todos os contextos.

Pontos envolvidos na análise atual:

- `modules/living-docs-externa/ui/reader/product-navigation.tsx`: navbar,
  seleção da área e renderização do conteúdo contextual;
- `modules/living-docs-externa/ui/reader/build-manual-nav.ts`: construção do
  índice e dos links rápidos do manual;
- `modules/living-docs-externa/services/documentation-navigation.ts`: seleção
  da área a partir da rota, operação e hash;
- `modules/living-docs-externa/ui/reader/manual-shell.tsx`: renderização do
  índice lateral e da navegação rápida em telas menores.

### Fora do escopo

- alterar a ordem ou o conteúdo técnico dos endpoints;
- criar documentação para subprodutos ainda não publicados;
- substituir a Jornada da Integração pelo Roteiro de Integração;
- criar uma nova camada de navegação paralela à navbar existente.

### Status da implementação

- Implementado o filtro contextual no componente compartilhado de navegação dos
  subprodutos.
- O índice de **Documentação** acompanha apenas o **Contexto** e suas seções;
  **Jornada da Integração**, **Roteiro de Integração**, **Queries**,
  **Mutations** e **Métodos** mantêm índices próprios.
- O **Fluxograma Individual** é exibido como item subordinado ao roteiro quando
  existe fluxograma publicado para o subproduto.
- Índices extensos possuem rolagem interna no desktop, sem deslocar o conteúdo
  principal da página.
- A navegação rápida mobile usa os mesmos itens do índice desktop.
- Validação E2E concluída no Canal Autorizador para desktop e mobile.

### Próximo passo

Repetir a conferência nos demais subprodutos publicados, verificando em especial
as áreas sem documentação disponível e os links de fluxograma individual.

<a id="edi-14333"></a>

## EDI-14333 — refinamento visual e estrutura inicial do Credenciado

### Contexto

Esta issue concentra o refinamento da experiência visual do Portal de Integração
e a organização inicial do produto **Credenciado**. O objetivo é preparar uma
base clara para que o fornecedor entenda os fluxos, identifique o conteúdo
disponível e saiba quais partes ainda serão construídas.

O foco desta etapa é o refinamento. A implementação deve acontecer somente
depois da validação deste registro pela equipe responsável.

### Escopo da issue

- adequar a identidade visual do portal à marca Funcional;
- utilizar os logotipos existentes na pasta `img/`;
- consolidar a paleta de cores do portal;
- melhorar contraste, espaçamento, hierarquia visual e estados de navegação;
- apresentar a estrutura inicial do Credenciado sem simular documentação
  publicada;
- preservar a separação entre **Jornada da Integração** e **Roteiro de
  Integração**;
- preparar a navegação para receber futuramente endpoints, exemplos, regras e
  orientações por fluxo e subproduto.

### Isolamento do trabalho

- Issue de referência: **EDI-14333**.
- Branch de trabalho prevista: `edi-14333`, derivada de `homolog`.
- Não misturar alterações ou escopo das issues EDI-14331 e EDI-14332.
- Não transportar conteúdo, links ou exemplos de teste para esta entrega.
- As alterações existentes no working tree devem ser tratadas como rascunho até
  serem conferidas contra este refinamento; não representam entrega final.

### Objetivo da experiência

O fornecedor deve conseguir responder, ao acessar o Credenciado:

1. Em qual produto, fluxo e etapa estou?
2. Qual conteúdo já está disponível?
3. O que ainda está em construção?
4. Qual será o próximo passo da integração?

A navegação deve seguir a hierarquia:

`Portal de Integração → Produto → Fluxo ou subproduto → Tipo de conteúdo → Etapa → Endpoint ou orientação técnica`.

### Diretrizes visuais

#### Identidade

- utilizar o logotipo principal da Funcional no cabeçalho;
- utilizar o logotipo branco somente em áreas de fundo escuro ou destaque;
- manter a marca como elemento de identificação, sem competir com o conteúdo
  técnico;
- centralizar a referência aos arquivos da pasta `img/`, sem duplicar assets
  desnecessariamente.

#### Paleta

A paleta deve partir do verde escuro presente no logotipo da Funcional:

- verde escuro para cabeçalho, títulos de destaque e ações principais;
- tons claros de verde para seleção, agrupamento e destaque contextual;
- branco para as superfícies principais;
- cinzas neutros para textos secundários, bordas e áreas de apoio;
- cores semânticas para estados como publicado, em construção e indisponível.

As cores devem ajudar a localizar e interpretar o conteúdo. Não devem ser
utilizadas apenas como decoração.

#### Interface

- manter leitura rápida e hierarquia clara;
- usar espaçamento consistente entre navegação, conteúdo e índice;
- evitar excesso de tabelas, cards ou elementos concorrendo pela atenção;
- construir a estrutura do Credenciado na navbar contextual, mantendo no centro
  apenas o conteúdo da área selecionada;
- não repetir a árvore estrutural do Credenciado em um card central de visão
  geral;
- reservar as etapas internas da jornada, o detalhamento por fluxo e a versão
  do subproduto para o índice contextual de cada subproduto;
- manter no rodapé a identificação do portal, copyright e reserva de direitos;
- destacar o logotipo do hero sem competir com o título e a orientação inicial;
- preservar foco visível e contraste adequado;
- manter a experiência funcional em desktop e mobile;
- não criar dependências ou abstrações visuais sem necessidade comprovada.

### Estrutura inicial do Credenciado

O produto deve expor os níveis principais do mapa na navbar contextual. As
etapas internas da jornada, o detalhamento por fluxo e a versão de cada
subproduto devem aparecer no índice contextual da documentação correspondente.
Os itens sem conteúdo devem ser apresentados como planejados ou em construção,
sem rotas quebradas e sem exemplos fictícios. A área central deve apresentar
somente o conteúdo correspondente à opção selecionada na navbar.

```text
Credenciado
├── Visão Geral
├── Fluxograma Completo
├── Roteiro de Integração
├── Fluxo de Cadastro
│   ├── Jornada de Integração
│   │   ├── Criação do token
│   │   ├── Avaliar elegibilidade
│   │   ├── Inscrição do beneficiário
│   │   └── Associar o produto ao cadastro do beneficiário
│   ├── Fluxograma Individual
│   └── Versão do subproduto
├── Fluxo Opt-in
│   └── Versão do subproduto
├── Fluxo de Venda
│   ├── PBM
│   ├── BF
│   └── Versão do subproduto
└── Fluxo PBM no Caixa
    └── Versão do subproduto
```

Esta estrutura é um mapa de evolução. Ela não significa que todos os conteúdos
já estejam publicados.

### Separação entre jornada e roteiro

#### Jornada da Integração

Deve apresentar a sequência funcional do processo e a visão que o fornecedor
precisa ter para entender a integração, incluindo quando aplicável:

- autenticação;
- criação ou obtenção do token;
- avaliação de elegibilidade;
- inscrição do beneficiário;
- associação do produto;
- continuidade do fluxo.

#### Roteiro de Integração

Deve ser desenvolvido posteriormente como guia detalhado de implementação de
cada fluxo. Para cada etapa, a estrutura deverá permitir registrar:

- objetivo;
- endpoint utilizado;
- método da requisição;
- pré-requisitos;
- dados obrigatórios;
- exemplo de requisição;
- retorno esperado;
- erros e tratamentos;
- ação seguinte;
- observações específicas do subproduto.

O roteiro não deve ser preenchido com dados inventados nesta etapa.

### Conteúdos futuros por fluxo

Quando um fluxo for desenvolvido, ele deverá poder conter:

- contexto e objetivo;
- participantes e pré-requisitos;
- jornada funcional;
- fluxograma geral;
- fluxograma individual;
- roteiro técnico;
- queries, mutations ou métodos REST;
- endpoints e exemplos validados;
- tabelas e regras de referência;
- códigos de retorno e tratamentos de erro.

As referências devem aparecer junto do fluxo ao qual pertencem, evitando que o
fornecedor precise procurar informações em uma área genérica ou desconectada.

### Estados de conteúdo

Cada item deve permitir uma indicação visual de estado:

- **Planejado:** estrutura criada, conteúdo ainda não iniciado;
- **Em construção:** conteúdo em desenvolvimento;
- **Em revisão:** conteúdo aguardando validação;
- **Publicado:** conteúdo disponível para uso;
- **Indisponível:** conteúdo temporariamente não acessível.

O estado deve ser informativo e não deve substituir o conteúdo ou criar a
impressão de que uma etapa está pronta quando ainda não está.

No Credenciado, a identificação inicial deve combinar a etiqueta de ambiente
**homolog** com o estado **Sem documentação**, mantendo claro que o produto está
previsto para validação, mas ainda não possui conteúdo publicado.

### Critérios de aceite do refinamento

- o logotipo e a paleta da Funcional estão definidos como padrão visual do
  portal;
- os estados de navegação e disponibilidade são visualmente distinguíveis;
- a estrutura inicial do Credenciado está documentada e compreensível;
- os fluxos de Cadastro, Opt-in, Venda e PBM no Caixa estão representados;
- Jornada da Integração e Roteiro de Integração possuem responsabilidades
  diferentes e explícitas;
- os itens sem conteúdo são identificados como planejados ou em construção;
- nenhum item sem documentação apresenta link quebrado ou exemplo fictício;
- a navegação não repete índices irrelevantes nem mistura contextos de áreas
  diferentes;
- a estrutura permite adicionar endpoints e orientações sem reorganizar toda a
  navegação;
- a proposta considera desktop, mobile, contraste e navegação por teclado;
- o escopo permanece restrito à EDI-14333.

### Fora do escopo

- preencher toda a documentação do Credenciado;
- definir endpoints sem validação do time responsável;
- criar exemplos reais de requisição nesta etapa;
- implementar a homologação dos fluxos;
- criar novos subprodutos ou fluxos fora da estrutura validada;
- alterar autenticação, autorização ou regras de acesso;
- replicar soluções das EDI-14331 e EDI-14332;
- adicionar uma nova camada de navegação paralela à navbar existente.

### Orientação para o desenvolvimento posterior

Antes de implementar, revisar principalmente:

- `core/ui/app-shell.tsx`: cabeçalho e casca visual compartilhada;
- `app/page.tsx`: abertura e apresentação principal do portal;
- `app/globals.css`: base visual global;
- `tailwind.config.ts`: tokens da paleta;
- `modules/living-docs-externa/ui/reader/product-navigation.tsx`:
  navegação contextual, conteúdo e índice do subproduto;
- `content/products/credenciado/config.json`: configuração do produto e dos
  módulos;
- `img/`: ativos oficiais da marca.

O desenvolvimento deve reutilizar os componentes e tokens existentes, fazendo
o menor diff possível e mantendo a fonte de verdade da navegação no modelo já
existente do portal.

### Status

**Refinamento em validação.** Nenhuma implementação desta issue deve ser
considerada concluída antes da aprovação deste registro e da conferência visual
no portal.

## EDI-14334 — Portal de FAQ de integração

### Objetivo

Criar uma área de FAQ no Portal EDI para responder dúvidas frequentes de
integração, combinando orientações genéricas com dúvidas específicas dos
produtos. A FAQ deve ajudar o fornecedor a identificar o próximo passo sem
substituir a documentação técnica, a jornada ou o roteiro de cada produto.

### Problema que a FAQ resolve

Hoje uma dúvida pode exigir a leitura de várias partes do portal ou depender de
uma orientação informal do time. Isso dificulta o início da integração, aumenta
as solicitações repetidas e não deixa claro quando a pessoa deve consultar a
documentação ou pedir apoio.

A FAQ funciona como uma camada de orientação rápida: responde dúvidas pontuais,
direciona para a documentação quando a resposta depender de um fluxo ou regra
específica e não inventa endpoints, credenciais, e-mails ou regras não
validadas.

### Experiência esperada do fornecedor

1. Encontra um atalho claro para **FAQ** na navegação global e na entrada do
   portal.
2. Pesquisa por texto ou filtra por categoria.
3. Consulta perguntas expansíveis, com resposta curta e links relacionados.
4. Identifica quando o conteúdo é geral ou relacionado a um produto.
5. Quando necessário, reúne produto, fluxo, ambiente, data e horário,
   identificador da requisição, resultado esperado, resultado recebido e uma
   mensagem de erro sanitizada antes de pedir apoio.

### Organização e publicação do conteúdo

O conteúdo inicial cobre dúvidas genéricas — primeiros passos, produto,
subproduto, fluxo, homologação, produção, validação e erros — e dúvidas
específicas do Canal Autorizador e Credenciado.

Na primeira versão, ele permanece versionado no projeto, sem banco de dados:

- um índice JSON com categorias, perguntas, ordem, status e links;
- um Markdown por resposta;
- status `draft`, `review` e `published`;
- somente perguntas `published` aparecem para o fornecedor;
- links internos apontam apenas para rotas reais do portal.

### Navegação, segurança e apoio

A FAQ é uma área própria, acessível pela navegação global e pela página inicial.
A busca considera título, categoria e texto da resposta; o filtro separa dúvidas
gerais das relacionadas a produtos. A interface deve permanecer acessível em
desktop e mobile, com foco visível e textos compreensíveis sem depender apenas
de ícones ou cores.

O contato oficial e o fluxo de SAC não são definidos nesta issue. Enquanto não
houver validação da equipe responsável, a FAQ mantém orientação neutra e não
expõe tokens, senhas, dados pessoais, credenciais ou exemplos de acesso real.

### Manutenção futura versionada

CRUD administrativo, autosave, salvamento direto no GitHub e publicação
automática ficam fora desta etapa. Quando forem implementados, exigirão SSO,
autorização explícita de colaboradores EDI, revisão por outro colaborador e
trilha de auditoria com autor, data, status e Pull Request.

### Critérios de aceite

- Há um modelo claro de perguntas genéricas e específicas de produto.
- O fornecedor entende quando usar a FAQ e quando seguir para a documentação.
- Navegação global, atalho inicial, busca, filtro e links relacionados existem.
- O conteúdo é versionado em Markdown/JSON e respeita o status de publicação.
- Rascunhos e itens em revisão não são exibidos ao fornecedor.
- Contato oficial e fluxo de SAC permanecem pendentes de validação, sem valores
  inventados.
- CRUD, autosave e Pull Request automatizado continuam como etapa futura.

### Diretriz para o desenvolvimento

Implementar somente a leitura da FAQ, reutilizando os padrões existentes de
módulos, navegação e conteúdo versionado. Não criar banco de dados, CRUD,
autosave, integração de SAC, e-mail fixo ou publicação automática nesta fase.
