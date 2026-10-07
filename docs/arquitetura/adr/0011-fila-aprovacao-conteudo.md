# ADR-0011: Fila de aprovação e publicação versionada de conteúdo

- **Status:** Proposta
- **Data:** 2026-09-28

## Contexto

O time de EDI precisa alterar documentação (nomes, descrições, seções, layouts
de manual) **pela tela do portal**, sem depender de desenvolvimento. Hoje o
editor grava direto no conteúdo: quem edita publica, sem segunda pessoa.

Autonomia sem controle é risco de negócio — um nome errado em um manual de
integração é um distribuidor integrando errado. O requisito é que **nenhuma
alteração chegue ao distribuidor sem aprovação do time de qualidade**, que cada
aprovação vire uma **versão**, e que a qualidade possa **restaurar uma versão
anterior pela própria tela**, sem mexer em código.

Restrições da fundação:

- `core/db` declara a capacidade `queue` como indisponível (ADR-0002);
  `requireDatabase()` falha de propósito. Não há banco e não queremos um.
- ADR-0009 já estabelece `content/` no Git como CMS, com adapter local e GitHub.
- `docs/migracao/github-cms-staging.md` já define que a aprovação oficial não
  pode ser paralela ao Pull Request.
- Módulos não importam módulos (`npm run arch` quebra o CI).

O estudo comparativo de mercado e de alternativas está em
[`docs/arquitetura/estudo-fila-aprovacao-conteudo.md`](../estudo-fila-aprovacao-conteudo.md).

## Decisão

Adotamos o **editorial workflow git-backed**: o Pull Request *é* a fila de
aprovação, e o portal é a interface dela. Não há fila em banco.

1. **Envio.** "Enviar para validação" no editor grava um **commit atômico**
   (`manual.json` + `sections/*.md` + `config.json`) via **Git Data API**
   (blob → tree → commit → ref) em uma branch `content/<slug>/<identificador>`.
   Uma branch e um PR por manual: editar de novo antes da aprovação adiciona
   commit ao PR existente.
2. **Estado.** O estado da alteração é o **label do PR**
   (`conteudo:em-revisao`, `conteudo:ajustes`, `conteudo:aprovado`). Nada é
   persistido no portal; a tela `/admin/fila` é uma projeção da API do GitHub,
   com cache de 30–60s.
3. **Gate automático antes do humano.** O CI roda Zod, `npm run
   content:validate-published`, `evaluateManualQuality()` e um check que reprova
   qualquer PR que toque fora de `content/**`. A qualidade só gasta atenção no
   que passou no básico.
4. **Aprovação.** Aprovar na tela registra review e faz **merge direto em
   `main`** através de uma **GitHub App** do portal. Segregação de funções
   ("4 olhos") é validada **no servidor**, comparando o trailer
   `Portal-Author:` do PR com o e-mail de quem aprova.
5. **Publicação.** O merge publica. Um webhook do GitHub (assinatura HMAC
   verificada) chama `POST /api/content/revalidate`, que invalida as tags de
   cache. Publicação de conteúdo **não depende de deploy de código**.
6. **Versão.** No merge, o servidor incrementa `manualVersion` (semântico) e
   acrescenta uma entrada em `versionHistory[]` com data, autor, resumo e o
   **SHA do commit**. O tipo de bump é sugerido pelo diff estruturado —
   operação removida ou renomeada é *major*, operação nova é *minor*, texto é
   *patch* — e confirmado pelo editor no envio.
7. **Restauração.** Restaurar uma versão anterior é uma operação de tela, aberta
   a partir do `versionHistory`: o servidor lê o conteúdo naquele SHA e abre uma
   **nova proposta na mesma fila** (label `conteudo:restauracao`), que a
   qualidade aprova como qualquer outra. Nunca reescrevemos histórico e nunca
   publicamos restauração sem aprovação. O histórico **não é armazenado pelo
   portal** — é o próprio histórico do Git.
8. **Emergência.** Despublicar (`published: false`) continua **fora da fila** e
   imediato, como já é hoje em `setProjectPublished`. Tirar do ar nunca bloqueia.
9. **Papéis.** `editor` (envia, não aprova), `reviewer` (aprova, não aprova o
   que enviou) e `admin` (tudo, inclusive despublicar), configurados em
   `data/permissions.json` e migráveis para grupos do SSO. Nunca liberar por
   domínio de e-mail.
10. **Localização do código.** A fila, os estados, a aprovação e o cálculo de
    versão vivem em um módulo novo **`modules/publicacao/`** — não dentro de
    `living-docs-externa`, porque `manuais-internos` precisará da mesma fila e
    um módulo não pode importar outro. A mecânica de Git (escrever, abrir PR,
    fazer merge) entra em `core/db/adapters/github-content-store.ts`, sem regra
    editorial.
11. **Repositório.** O conteúdo permanece no **mesmo repositório do código**
    (`Funcional-Edi/portal-edi`). A separação em repositório de conteúdo fica
    para quando o volume ou o risco do token justificar.
12. **Leitura por referência.** `github-content-store` passa a aceitar `ref` na
    leitura: o distribuidor lê `main`, o editor lê a branch da própria proposta,
    a restauração lê um SHA antigo.

## Consequências

**Fica mais fácil:**

- A fila, o diff, o histórico, a autoria, os comentários, a auditoria e a
  restauração vêm do Git — nada disso é código nosso para escrever e manter.
- Nenhum banco novo; a capacidade `content` do ADR-0002 continua suficiente.
- Se o portal cair, as alterações pendentes continuam íntegras no GitHub.
- O time de qualidade e o time de EDI nunca abrem o GitHub, mas tudo que fazem
  fica lá, auditável.
- Restaurar uma versão é a mesma operação de sempre, com o mesmo controle.

**Fica mais difícil:**

- Dependemos da disponibilidade e do rate limit da API do GitHub para a tela de
  fila (mitigado por cache e webhook em vez de polling).
- O portal precisa de uma GitHub App com permissão de escrita — um segredo novo
  e um controle novo a registrar em `modules/compliance/data/controls.ts`.
- A aprovação é registrada pela App, não pela conta GitHub do aprovador (o time
  de qualidade não tem conta). A identidade humana fica no trailer do commit e
  no corpo da review, não na identidade do GitHub.
- Conflito de edição concorrente precisa ser tratado de verdade (rebase a partir
  da `main` atual, ou recusa explícita) — nunca sobrescrita silenciosa.
- `versionHistory` ganha um campo `commit` opcional no schema Zod.

**Revisar quando:** o volume de alterações tornar o rate limit ou a latência da
API do GitHub um gargalo; a qualidade precisar de publicação agendada; ou o
risco do token de escrita justificar repositório de conteúdo separado.
