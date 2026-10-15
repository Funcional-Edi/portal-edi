# Modelo de análise e reanálise de roteiros de homologação

## Finalidade

Este documento orienta a análise de roteiros de homologação de fornecedores e clientes integrados ao Portal EDI. Ele deve ser usado tanto na primeira avaliação quanto em reanálises realizadas após correções.

O objetivo é produzir um parecer técnico rastreável, com critérios uniformes, evidências suficientes e uma conclusão que possa ser revisada por outra pessoa sem depender de contexto verbal.

Para integrações de Credenciado, consulte também a [base de conhecimento da documentação de Credenciado](./credenciado-conteudo.md). Essa base concentra as regras funcionais e técnicas publicadas no portal; este documento concentra o método de análise.

## Princípios da análise

1. A documentação publicada define o comportamento técnico esperado da API.
2. O modelo de homologação define a estrutura do relatório e o padrão mínimo de evidências.
3. Uma resposta de sucesso não comprova, sozinha, que a requisição foi montada corretamente.
4. Cada conclusão deve estar ligada a uma requisição, uma resposta e uma regra documentada.
5. Não se deve completar lacunas por suposição. Ausência de evidência é registrada como pendência.
6. Reanálise não apaga o apontamento original: registra o problema anterior, a correção esperada, o que foi observado e o novo status.
7. Dados pessoais, cartões, tokens, senhas e segredos devem ser mascarados no relatório e nas evidências compartilhadas.

## Fontes e ordem de precedência

Quando houver divergência entre fontes, use esta ordem:

1. **Schema GraphQL publicado:** campos, tipos, obrigatoriedade, nulabilidade, enums e estrutura da operação.
2. **Manual da operação:** finalidade, fluxo, regras, exemplos e relacionamentos com outras operações.
3. **Documentação do módulo:** contexto, segurança, jornadas e regras de negócio comuns.
4. **Base consolidada de Credenciado:** apoio à consulta e navegação entre regras já publicadas.
5. **Modelo de homologação:** organização dos cenários, evidências e parecer; não substitui as regras da API.

Se a documentação não definir o comportamento esperado, classifique o item como lacuna documental ou necessidade de validação da Funcional. Não atribua automaticamente o erro ao fornecedor.

## Entradas necessárias

Antes de começar, reunir:

- roteiro de homologação enviado pelo fornecedor;
- modelo vigente de relatório de homologação;
- documentação publicada das operações avaliadas;
- identificação do cliente ou fornecedor;
- ambiente utilizado;
- versão ou build do sistema homologado;
- data da execução;
- responsável pela execução;
- credenciais válidas para os testes, quando aplicável;
- massa de dados e pré-condições usadas nos cenários;
- imagens, logs ou outras evidências mencionadas no roteiro.

Se alguma informação não estiver disponível, mantê-la como **Não informada** e abrir uma pendência de completude. Não inventar metadados.

## Dados obrigatórios para rastreabilidade no DCsintra

Em todo cenário aplicável, localizar e registrar os dados abaixo. Eles são usados para pesquisar a transação na plataforma DCsintra e realizar a análise visual do processamento:

| Campo | Como registrar |
|---|---|
| `CustomerCode` | Valor exato usado na requisição, com a grafia apresentada no roteiro |
| `authorizationID` | Identificador exato retornado ou utilizado no fluxo |
| `sequenceID` | Sequência exata associada à transação |
| `createdAt` | Data e hora completas, preservando formato, segundos e fuso quando informado |

Para cada valor, informar também:

- cenário ao qual pertence;
- operação e etapa de origem;
- localização da evidência no roteiro;
- se o dado veio da requisição ou da resposta;
- operações seguintes nas quais o valor foi reutilizado;
- divergências encontradas entre etapas.

Os valores devem ser copiados exatamente como aparecem na evidência, sem corrigir formato, horário, zeros ou capitalização. Se um campo aplicável estiver ausente, registrar a pendência e solicitar nova evidência ao fornecedor.

Esses dados devem permanecer completos na versão interna destinada à consulta no DCsintra, observando o controle de acesso do documento. Em versões externas ou compartilhadas fora do grupo autorizado, mascarar os dados pessoais e identificadores conforme a política de segurança aplicável.

## Modalidades de trabalho

### Primeira análise

Na primeira análise, deve-se verificar simultaneamente:

- cobertura dos cenários previstos no modelo;
- aderência técnica de cada requisição e resposta;
- continuidade entre operações do mesmo fluxo;
- presença e legibilidade das evidências;
- resultado geral do roteiro.

### Reanálise

Na reanálise, preservar o histórico e avaliar somente com base em nova evidência. Para cada apontamento anterior, registrar:

| Campo | Conteúdo esperado |
|---|---|
| Apontamento original | O desvio encontrado na análise anterior |
| Regra de referência | Fonte e regra usada na avaliação |
| Correção esperada | O que precisava ser alterado ou demonstrado |
| Evidência da reanálise | Nova requisição, resposta, imagem ou justificativa |
| Resultado observado | O que efetivamente foi corrigido ou permaneceu divergente |
| Novo status | Aprovado, Parcial, Reprovado, Não executado ou Não aplicável |
| Observação | Restrição, dúvida documental ou ação remanescente |

Uma correção só pode ser considerada concluída quando a nova execução demonstrar o comportamento esperado. Alteração textual no roteiro sem evidência correspondente não encerra a pendência.

## Processo de análise

### 1. Preservar o material recebido

- manter o arquivo original sem alterações;
- identificar nome, data e versão do material analisado;
- trabalhar em um relatório separado;
- registrar se a avaliação é inicial ou reanálise;
- relacionar, em reanálises, a versão atual à análise anterior.

### 2. Inventariar cenários e operações

Montar uma lista com todos os cenários presentes no roteiro, incluindo:

- módulo;
- operação;
- finalidade do cenário;
- tipo: positivo, negativo, alternativo ou não aplicável;
- pré-condições;
- identificador da evidência;
- posição no roteiro;
- resultado informado pelo executor.

Não contar apenas títulos. Uma mesma operação pode aparecer em fluxos distintos e cada execução relevante deve ser avaliada.

### 3. Conferir cobertura contra o modelo

Comparar o inventário com as seções exigidas pelo modelo vigente. Para o modelo atualmente adotado, a estrutura mínima contempla:

1. programa Farmácia: elegibilidade, adesão, opt-in e inclusão de produto;
2. cargas e regras comerciais;
3. venda PBM da indústria;
4. Benefício Farmácia: folha, receita, venda parcial, dinheiro e cartão IBM, quando aplicáveis;
5. cancelamento;
6. cenários de erro previstos no modelo;
7. evidências visuais;
8. detalhamento de requisições e respostas;
9. conclusão.

Um cenário ausente não deve ser marcado como aprovado. Classifique-o como **Não executado** ou **Não aplicável**, sempre com justificativa.

### 4. Validar a requisição

Para cada operação, conferir:

- nome correto da query ou mutation;
- campos obrigatórios do input;
- tipos e formatos;
- enumerações válidas;
- origem correta da transação;
- campos condicionais exigidos pela resposta de uma etapa anterior;
- coerência de CPF, CNPJ, cartão, programa, produto e estabelecimento;
- quantidade do produto e da prescrição;
- datas e horários;
- identificadores reaproveitados de operações anteriores;
- ausência de campos que não se aplicam ao cenário;
- seleção dos campos necessários na resposta.

### 5. Validar a resposta

Verificar:

- status e mensagens retornadas;
- dados esperados para o cenário;
- coerência entre mensagem, código e conteúdo;
- presença de campos necessários às próximas etapas;
- valores condicionais que alteram a montagem da requisição seguinte;
- ausência de contradições, como mensagem de não encontrado acompanhada de identificador válido inesperado.

Quando o comportamento parecer inconsistente com a documentação, separar claramente:

- possível falha do integrador;
- possível falha da API;
- lacuna da documentação;
- evidência insuficiente.

### 6. Validar a continuidade do fluxo

Fluxos encadeados devem reutilizar exatamente os dados retornados pela etapa anterior quando a documentação assim exigir. Conferir, entre outros:

- identificador da pré-autorização usado na confirmação;
- identificador e data/hora da confirmação usados no cancelamento;
- `CustomerCode`, `authorizationID`, `sequenceID` e `createdAt` registrados para consulta no DCsintra;
- CPF ou beneficiário mantido em todas as etapas do opt-in;
- quantidades mantidas entre pré-autorização e confirmação;
- campos dinâmicos retornados na elegibilidade enviados na adesão;
- dose diária mantida na confirmação quando exigida na pré-autorização;
- dados fiscais usados na atualização ou consulta fiscal posterior.

Não validar operações isoladamente quando elas pertencem ao mesmo fluxo. Uma requisição correta com dados originados de outro cenário não comprova a jornada.

### 7. Validar cenários negativos

Um teste negativo só é válido quando alcança a regra que pretende testar.

Exemplos:

- para testar uma pré-autorização inexistente, a autenticação precisa estar válida;
- para testar CNPJ inválido, a resposta deve representar a validação do CNPJ, e não falha de transporte;
- para testar quantidade inválida, os demais campos devem permitir que a requisição chegue à regra de quantidade.

Se a execução for interrompida antes da regra-alvo — por autenticação, autorização, indisponibilidade ou payload malformado — classifique o teste como **Reprovado** ou **Não executado**, conforme o caso, e solicite nova execução.

### 8. Validar evidências

Cada cenário deve permitir reconstruir o teste. A evidência mínima contém:

- identificação do cenário;
- requisição completa, com segredos mascarados;
- resposta completa;
- data e ambiente da execução;
- vínculo claro entre requisição e resposta;
- imagem ou log legível quando exigido pelo modelo;
- identificação suficiente para relacionar etapas do mesmo fluxo.

Uma indicação como “imagem indisponível” não vale como evidência. Registrar pendência e solicitar substituição.

### 9. Classificar o resultado

| Status | Critério de uso |
|---|---|
| **Aprovado** | Execução aderente à documentação, com evidência suficiente e fluxo coerente |
| **Parcial** | Parte relevante está correta, mas existe lacuna, inconsistência ou validação pendente que não invalida toda a execução |
| **Reprovado** | Requisição, resposta ou encadeamento diverge da regra, ou o teste negativo não alcança a regra-alvo |
| **Não executado** | Não há execução ou evidência suficiente para avaliar o cenário |
| **Não aplicável** | O cenário não faz parte da integração avaliada e há justificativa objetiva |

Não usar **Parcial** apenas para suavizar uma reprovação. O relatório deve explicar exatamente qual parte foi comprovada e qual parte permanece pendente.

### 10. Realizar dupla análise

Antes de concluir, uma segunda pessoa deve revisar os pontos de maior risco e a coerência do relatório. A dupla análise deve conferir:

- todas as operações do inventário foram classificadas;
- os campos citados no parecer realmente aparecem nas evidências;
- as regras usadas estão documentadas na fonte indicada;
- os dados encadeados são idênticos, inclusive data, hora e quantidade;
- os quatro dados de rastreabilidade do DCsintra foram coletados em todos os cenários aplicáveis e vinculados à operação correta;
- nenhum teste negativo foi bloqueado por erro anterior à regra-alvo;
- itens não aplicáveis têm justificativa;
- todas as imagens estão disponíveis e legíveis;
- os totais do resumo correspondem aos itens detalhados;
- as pendências têm ação, responsável ou destino de validação;
- dados sensíveis foram mascarados;
- a conclusão é compatível com os resultados detalhados.

## Validações específicas recorrentes de Credenciado

Esta lista é um apoio de triagem. A regra vigente deve sempre ser confirmada na documentação publicada.

### Programa Farmácia

- `Pharma_assessEligibility`: solicitar e avaliar `extraFormFields`, incluindo respostas e perguntas relacionadas quando disponíveis.
- `Pharma_signUpProgramBeneficiary`: propagar os campos dinâmicos obrigatórios retornados na elegibilidade.
- fluxo de opt-in: manter o mesmo beneficiário e verificar a sequência de envio, validação e recuperação dos termos.
- `Pharma_addProduct`: validar programa, beneficiário, produto, quantidade e demais vínculos do cenário.

### Regras e descontos

- `Pharma_discountPrograms`: em integração de PDV, validar a origem `POINT_OF_SALES`.
- `Pharma_displayProductDiscountRules`: em integração de PDV, validar a origem `POINT_OF_SALES`.
- respostas vazias em consultas não devem ser tratadas automaticamente como erro; comparar com o comportamento documentado para a entrada usada.

### Venda e Benefício Farmácia

- `Sales_preAuthorizeSale`: validar produto, quantidade, prescrição, meio de pagamento e campos condicionais.
- `dailyDose`: enviar quando a resposta ou regra do cenário indicar `requiredInformDailyDose`; não concluir apenas pelo nome do cartão.
- `Sales_confirmPreAuthorizedSale`: manter as quantidades e os campos condicionais da pré-autorização, conforme a regra do fluxo.
- `Sales_cancel`: enviar exatamente os identificadores e a data/hora retornados na confirmação.
- receita e dispensação: conferir a igualdade entre a quantidade do produto e a quantidade prescrita quando essa relação for exigida.

### Erros e mensagens

- validar se código, mensagem e dados retornados descrevem o mesmo resultado;
- separar erro de autenticação da validação funcional pretendida;
- quando a documentação não publicar código ou mensagem esperada, encaminhar para validação da Funcional em vez de presumir conformidade ou não conformidade.

## Pontos de atenção aprendidos em análises anteriores

- Um campo pode ser condicional, e não exclusivo de um produto ou cartão. Verifique a condição publicada.
- Campos dinâmicos retornados por uma operação precisam ser tratados nas etapas posteriores quando marcados como obrigatórios.
- Requisições do mesmo fluxo com CPFs ou identificadores diferentes quebram a rastreabilidade.
- Um cenário negativo que retorna `UNAUTHENTICATED` não valida a regra de negócio pretendida.
- Lista vazia, erro genérico e ausência de mensagem são comportamentos diferentes e devem ser descritos separadamente.
- O identificador retornado deve ser confrontado com a mensagem; não basta conferir apenas o status geral.
- Quantidades iguais na pré-autorização não garantem que foram mantidas na confirmação.
- O horário do cancelamento deve ser comparado caractere a caractere com o retorno da confirmação quando a operação exige o valor exato.
- Evidência visual ausente precisa aparecer como pendência, mesmo quando o texto do roteiro descreve sucesso.
- O modelo do relatório não deve ser usado para criar uma regra técnica que não existe no schema ou no manual.

## Estrutura recomendada do relatório

### 1. Identificação

- cliente ou fornecedor;
- sistema e versão;
- ambiente;
- data da execução;
- data da análise ou reanálise;
- responsável pela execução;
- analista e revisor;
- arquivos e versões avaliados.

### 2. Resumo executivo

Informar:

- objetivo da avaliação;
- abrangência;
- total de itens por status;
- resultado geral;
- riscos que impedem aprovação plena;
- recomendação de continuidade, correção ou nova execução.

### 3. Pendências prioritárias

Listar somente itens acionáveis, com:

- cenário e operação;
- desvio;
- regra esperada;
- impacto;
- ação necessária;
- destino da ação: fornecedor, Funcional ou documentação;
- evidência necessária para encerramento.

### 4. Rastreabilidade no DCsintra

Registrar os dados necessários para localizar cada execução:

| Cenário | Operação de origem | `CustomerCode` | `authorizationID` | `sequenceID` | `createdAt` | Requisição/Resposta | Evidência |
|---|---|---|---|---|---|---|---|
| [Preencher] | [Preencher] | [Preencher] | [Preencher] | [Preencher] | [Preencher] | [Preencher] | [Referência] |

Quando um campo não se aplicar à operação, usar **Não aplicável**. Quando deveria existir, mas não estiver disponível, usar **Não informado** e abrir pendência.

### 5. Matriz detalhada

| ID | Cenário | Operação | Tipo | Evidência | Resultado observado | Regra esperada | Status | Pendência ou ação |
|---|---|---|---|---|---|---|---|---|
| 1 | [Preencher] | [Preencher] | Positivo/Negativo | [Referência] | [Preencher] | [Fonte] | [Status] | [Preencher] |

### 6. Cenários de erro

Manter uma seção própria para demonstrar que cada teste alcançou a regra-alvo e retornou comportamento compatível com a documentação.

### 7. Evidências visuais

Relacionar cada imagem à operação e ao cenário correspondente. Informar quando uma imagem estiver ausente, cortada ou ilegível.

### 8. Requisições e respostas

Apresentar os payloads completos necessários à conferência, com dados sensíveis mascarados. Em fluxos encadeados, destacar os valores reaproveitados entre etapas.

### 9. Histórico de reanálise

Usar a matriz de reanálise deste documento e preservar as datas e conclusões anteriores.

### 10. Conclusão

Usar uma das conclusões abaixo e justificá-la:

- **Aprovado:** não há pendências que impeçam a homologação.
- **Aprovado com pendências:** o fluxo principal foi comprovado, mas restam correções ou validações delimitadas.
- **Reprovado:** há divergência crítica ou falta de evidência essencial.
- **Inconclusivo:** o material disponível não permite emitir parecer técnico seguro.

## Contagem e consistência do relatório

Ao fechar o relatório:

1. somar todos os itens classificados;
2. confirmar que a soma por status corresponde ao total da matriz;
3. conferir que cada pendência do resumo aparece no detalhamento;
4. conferir que cada item reprovado ou parcial possui uma ação ou encaminhamento;
5. confirmar que a conclusão geral corresponde ao risco dos itens, e não apenas à maioria numérica.

Itens **Não aplicáveis** entram na contagem de cobertura, mas não devem melhorar artificialmente o índice de aprovação. Se for usado percentual, apresentar a fórmula e separar itens executados de itens não aplicáveis.

## Modelo rápido para nova análise

```md
# Relatório de homologação — [Cliente/Fornecedor]

## Identificação

- Tipo: Primeira análise / Reanálise
- Ambiente: [Preencher]
- Sistema/build: [Preencher]
- Execução: [Data e responsável]
- Análise: [Data, analista e revisor]
- Material avaliado: [Arquivo e versão]

## Resumo executivo

- Resultado geral: [Preencher]
- Total avaliado: [Preencher]
- Aprovados: [Preencher]
- Parciais: [Preencher]
- Reprovados: [Preencher]
- Não executados: [Preencher]
- Não aplicáveis: [Preencher]

## Pendências prioritárias

1. [Cenário/operação] — [Desvio, impacto, ação e evidência esperada]

## Rastreabilidade no DCsintra

| Cenário | Operação de origem | CustomerCode | authorizationID | sequenceID | createdAt | Origem do dado | Evidência |
|---|---|---|---|---|---|---|---|
| | | | | | | Requisição/Resposta | |

## Matriz detalhada

| ID | Cenário | Operação | Tipo | Evidência | Resultado observado | Regra esperada | Status | Pendência ou ação |
|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | |

## Histórico de reanálise

| Apontamento original | Correção esperada | Evidência nova | Resultado observado | Novo status | Observação |
|---|---|---|---|---|---|
| | | | | | |

## Conclusão

[Conclusão, riscos remanescentes e próximo passo]
```

## Critério de encerramento

A análise ou reanálise está concluída somente quando:

- todos os cenários foram inventariados e classificados;
- as regras técnicas foram verificadas nas fontes oficiais;
- os fluxos encadeados foram conferidos de ponta a ponta;
- os cenários negativos alcançaram a regra pretendida;
- as evidências são suficientes e rastreáveis;
- `CustomerCode`, `authorizationID`, `sequenceID` e `createdAt` foram registrados para todos os cenários aplicáveis;
- os totais e a conclusão são consistentes;
- a dupla análise foi registrada;
- as pendências remanescentes possuem encaminhamento claro.
