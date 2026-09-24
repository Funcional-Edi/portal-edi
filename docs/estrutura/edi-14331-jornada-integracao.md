# EDI 14331 Jornada e Roteiro de Integração

## Status

- Jira: EDI-14331
- Branch: `edi-14331`
- Tipo: refinamento de documentação e experiência de integração

## Objetivo

Reorganizar a documentação dos subprodutos para que o fornecedor entenda o processo completo de integração, desde o contexto inicial até a execução dos endpoints, os próximos passos, as exceções e a homologação.

A documentação deverá separar a visão macro da integração do roteiro técnico detalhado de implementação.

## Contexto atual

O conteúdo apresentado atualmente como roteiro reúne a ordem das operações e os principais endpoints do produto. Esse conteúdo está mais próximo de uma **Jornada da Integração**, pois ajuda o fornecedor a entender a sequência do processo e as dependências entre as etapas.

Será criado um novo conteúdo chamado **Roteiro de Integração**, com abordagem técnica e detalhada. Esse roteiro deverá explicar o que precisa ser observado em cada fluxo, quais endpoints devem ser utilizados, quais são os pré-requisitos e qual deve ser o próximo passo após cada resposta da API.

A alteração deverá ser aplicada aos subprodutos publicados e prevista estruturalmente para os subprodutos que ainda estão em desenvolvimento.

## Organização esperada por subproduto

Cada subproduto deverá apresentar seus conteúdos em uma ordem clara:

1. Contexto ou Visão geral
2. Jornada da Integração
3. Fluxograma Completo
4. Roteiro de Integração
5. Fluxos e operações disponíveis
6. Referência da API e endpoints
7. Teste de Requisição, quando disponível
8. Homologação e evidências, quando aplicável

### Jornada da Integração

A Jornada da Integração deverá apresentar a visão macro do processo, com linguagem orientada ao fornecedor.

Deverá explicar:

- objetivo da integração;
- etapas principais;
- primeiro passo para iniciar;
- endpoints utilizados em cada etapa;
- dependências entre etapas;
- momentos em que o fornecedor deve aguardar processamento ou alteração de status;
- caminhos alternativos;
- condições para avançar ou interromper o processo;
- pontos que precisam ser alinhados durante a homologação.

A jornada deverá conter links para os endpoints existentes. Os detalhes de payload, regras de campo, tratamento técnico e observações específicas ficarão no Roteiro de Integração.

### Roteiro de Integração

O Roteiro de Integração será desenvolvido e aplicado posteriormente como uma atividade própria de refinamento.

Para cada fluxo, deverá detalhar, conforme aplicável ao subproduto:

- objetivo do fluxo;
- quando utilizar;
- pré-requisitos;
- endpoint, query, mutation ou método HTTP;
- autenticação e headers necessários;
- dados obrigatórios de entrada;
- exemplo de requisição;
- resposta esperada;
- status possíveis;
- regra para decidir o próximo passo;
- dependências com outros endpoints ou componentes;
- erros e exceções;
- possibilidade de reprocessamento;
- regras de idempotência, quando existirem;
- evidência necessária para homologação;
- condição para considerar o fluxo concluído;
- particularidades e regras específicas do subproduto.

O fornecedor deverá conseguir responder, ao consultar o roteiro:

- Qual endpoint deve ser chamado primeiro?
- O que é necessário antes da primeira chamada?
- O que deve ser feito depois da resposta?
- Quando é necessário aguardar ou consultar novamente?
- Qual endpoint deve ser utilizado no próximo passo?
- Como tratar uma resposta de erro ou rejeição?
- Qual evidência deve ser apresentada na homologação?

## Exemplo de jornada com o Canal Autorizador

O Canal Autorizador pode ser usado como referência inicial para validar a nova organização:

1. Autenticar e obter o token.
2. Criar o pré-pedido.
3. Aguardar o processamento e consultar o pedido.
4. Enviar o retorno do pedido, quando aplicável.
5. Enviar a nota fiscal.
6. Acompanhar o status e o ressarcimento.
7. Realizar cancelamento, substituição da nota ou devolução quando necessário.
8. Consultar pedidos e alterações de status por filtros ou stream.

Esse exemplo representa a jornada. O Roteiro de Integração deverá detalhar cada etapa, seus endpoints, entradas, respostas, dependências, erros e decisões de continuidade.

## Escopo dos subprodutos

A estrutura deverá ser aplicada aos subprodutos publicados e prevista para os demais:

- **Credenciado**
  - Fluxo de Cadastro
  - Fluxo Opt-in
  - Fluxo de Venda
  - Fluxo PBM no Caixa
- **Movimentação de Vidas**
- **Trade**
  - Canal Autorizador
  - Wholesaler
  - IM
  - EDI Redes, quando houver documentação publicada
- **APS**
  - Delivery
- **PBM**
  - Reposição

Para subprodutos sem conteúdo publicado, o item poderá aparecer como **Em desenvolvimento**, sem links quebrados ou conteúdo incompleto apresentado como definitivo.

## Critérios de aceite

- A navegação de cada subproduto diferencia Jornada da Integração e Roteiro de Integração.
- O conteúdo atual de sequência de operações é reorganizado para representar a jornada completa do processo.
- É criado um novo item de navegação para o Roteiro de Integração.
- O novo roteiro possui estrutura própria para detalhamento técnico por fluxo.
- Cada fluxo identifica o primeiro endpoint, os endpoints seguintes e as condições de transição.
- As dependências entre endpoints ficam explícitas.
- Respostas assíncronas, alterações de status, rejeições, cancelamentos, reprocessamentos e caminhos alternativos são documentados quando aplicáveis.
- O fornecedor consegue entender o próximo passo sem consultar várias áreas diferentes da documentação.
- Os endpoints possuem ligação com sua referência técnica, operação ou exemplo de requisição.
- O fluxograma continua representando visualmente a jornada e não substitui o roteiro técnico.
- O conteúdo de homologação permanece disponível ou é referenciado a partir do roteiro adequado.
- A alteração é aplicada de forma consistente aos subprodutos publicados.
- Subprodutos ainda não publicados não apresentam links quebrados ou conteúdo fictício.
- Links e âncoras existentes são revisados para evitar referências antigas quebradas.

## Considerações técnicas

Atualmente, a navegação utiliza o item **Roteiro de Homologação** e a âncora `#roteiro-integracao` para apresentar a lista de operações do manual. A implementação deverá revisar essa nomenclatura e separar os identificadores da Jornada da Integração e do Roteiro de Integração.

A migração deverá preservar a compatibilidade com links existentes ou criar uma transição para evitar referências quebradas em testes, documentação, favoritos e links compartilhados.

## Etapas sugeridas

1. Ajustar a estrutura de navegação dos subprodutos.
2. Migrar o conteúdo atual para Jornada da Integração.
3. Definir o modelo do novo Roteiro de Integração.
4. Aplicar a estrutura ao Canal Autorizador como referência.
5. Replicar a análise nos demais subprodutos publicados.
6. Registrar a atividade futura de construção detalhada do roteiro por fluxo.

