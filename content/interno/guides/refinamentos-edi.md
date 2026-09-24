# Refinamentos e rastreamento — Portal EDI

Área interna para acompanhar refinamentos de produto, decisões de experiência,
cronograma, critérios de validação e próximos passos do portal EDI.

Use este índice para localizar o registro da atividade e o ponto atual de cada
frente. O acesso é restrito ao ambiente interno do time EDI em `/interno`.

## Documentos de acompanhamento

- [EDI-14331 — Jornada e Roteiro de Integração](/interno/edi-14331-jornada-integracao)
- [EDI-14332 — Navegação contextual dentro do subproduto](#edi-14332--navegação-contextual-dentro-do-subproduto)
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
