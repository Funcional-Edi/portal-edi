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
