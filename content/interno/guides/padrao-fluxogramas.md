# Padrão de construção e revisão de fluxogramas

Este guia define o processo obrigatório para criar ou revisar fluxogramas de
integração publicados no Portal EDI. O Canal Autorizador é a referência visual
inicial, mas as regras valem para todo subproduto.

## Fonte e escopo

1. Use o refinamento aprovado e o PDF/diagrama de negócio como fonte.
2. Preserve operações, decisões, status e responsabilidades das raias.
3. Não invente operações GraphQL, caminhos de exceção ou regras de negócio.
4. Edite o fluxo publicado em `content/projects/{slug}/flow.json`.

## Ordem de construção

1. Defina as raias e sua responsabilidade antes de posicionar os nós.
2. Dimensione a largura e a altura das raias para comportar todos os ramos,
   incluindo uma margem após o último nó.
3. Posicione os nós de início, operação, decisão e fim na ordem de leitura do
   fluxo.
4. Monte os ramos de decisão em linhas distintas, sem reutilizar a área visual
   do fluxo principal.
5. Conecte as arestas e inclua rótulos apenas quando eles forem necessários
   para identificar a condição, o status ou o resultado do ramo.
6. Só então vincule `operationRef` às operações que existem no manual curado.

## Regras visuais obrigatórias

- Use as caixas padronizadas do módulo: início, operação, decisão e fim.
- O texto inteiro da caixa, inclusive referências técnicas, deve quebrar dentro
  dela; nunca reduza a fonte para acomodar conteúdo.
- Reserve um corredor livre entre uma aresta rotulada e qualquer caixa. O
  rótulo não pode tocar, cruzar ou ficar visualmente sobreposto ao nó de origem,
  ao nó de destino ou a outra condição.
- Cada resultado de decisão deve ocupar uma linha ou coluna própria. Ramos de
  cancelamento, retorno, faturamento parcial e faturamento total não dividem o
  mesmo espaço.
- Aumente a raia antes de posicionar um nó dentro da responsabilidade de outra
  parte. Um nó nunca atravessa o limite da sua raia.
- Mantenha caixas e condições separadas: nenhuma caixa pode cobrir outra caixa,
  e nenhuma condição pode cobrir uma caixa.
- Não altere o modelo das arestas para resolver um problema de espaço. Primeiro
  ajuste as coordenadas dos nós, os ramos e as dimensões das raias.

## Revisão antes de publicar

1. Abra cada fluxo em `/fluxogramas/{slug}?fluxo={id}`.
2. Revise o começo, cada decisão e o término usando arraste, zoom e minimapa.
3. Confirme visualmente:
   - caixa–caixa: sem sobreposição;
   - rótulo–caixa: sem sobreposição;
   - ramos: leitura contínua, sem ambiguidade;
   - raias: responsabilidades preservadas.
4. Valide o conteúdo: nós de início e fim, arestas válidas e referências de
   operação existentes no manual.
5. Rode `npm run typecheck`, `npm run lint` e `npm run test:e2e`. O E2E usa a
   porta isolada 3003; não interrompa o portal em `localhost:3002`.

## Limitações conhecidas

- O fluxo é curado manualmente porque precisa reproduzir a regra de negócio e
  o diagrama aprovado. Não use auto-layout como substituto dessa revisão.
- Anotações com linhas auxiliares devem ser revisadas em fluxos largos, pois a
  área atual de desenho dessas linhas possui limite fixo.

## Evidência de revisão

No pull request ou registro da issue, informe a fonte utilizada, os fluxos
revisados, as decisões/ramos ajustados, a validação visual e o resultado dos
comandos de qualidade.
