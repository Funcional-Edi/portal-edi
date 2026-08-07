# Implementar uma feature nova

O ciclo completo, do "quero fazer X" até o código na `main`.

## Visão geral

```text
1. Entender  →  2. Branch  →  3. Testar (falha)  →  4. Implementar
      →  5. Testar (passa)  →  6. npm run ci  →  7. Commit  →  8. Push  →  9. PR
```

## 1. Entender antes de codar

Perguntas que evitam retrabalho:

| Pergunta | Onde procurar |
| --- | --- |
| Isso é de qual módulo? | `modules/registry.ts` |
| Já existe algo parecido? | busca global no Cursor (`Ctrl + Shift + F`) |
| Que camada muda? | `schema/`, `repository/`, `services/`, `ui/` |
| Tem decisão registrada? | `docs/arquitetura/adr/` |

## 2. Criar a branch

```powershell
git switch main
git pull
git switch -c feat/reordenar-operacoes
```

Detalhes em [[fluxo-branches|Branches]].

## 3. Escrever o teste primeiro

Parece contraintuitivo, mas economiza tempo: o teste define **o que** você quer antes
de decidir **como**.

```powershell
npm run test:watch
```

Crie `services/minha-coisa.test.ts` ao lado do service. O teste deve **falhar** —
prova que ele realmente testa algo.

## 4. Implementar respeitando as camadas

Ordem natural neste projeto, de dentro para fora:

| Ordem | Camada | Responsabilidade | Pode importar |
| --- | --- | --- | --- |
| 1 | `schema/` | Formato do dado (Zod) | nada do módulo |
| 2 | `repository/` | Ler/gravar arquivo | `schema/`, `core/db` |
| 3 | `services/` | Regra de negócio | `schema/`, `repository/` |
| 4 | `app/api/.../route.ts` | Receber HTTP, validar, chamar service | `services/` |
| 5 | `ui/` | Tela | `services/` via props/server component |

Regras que o `npm run arch` cobra:

- `core/` **não** importa `modules/` nem `app/`
- módulos **não** importam outros módulos (só via `core/events`)
- `services/` sem React/Next
- `repository/` sem regra de negócio
- rota fina: valida entrada e delega ao service

## 5. Rodar no navegador

```powershell
npm run dev
```

http://localhost:3002 — teste o caminho feliz **e** o caminho de erro.

## 6. Validar tudo

```powershell
npm run ci
```

Se quebrar, veja [[fluxo-quando-quebra|Quando algo quebra]].

## 7 a 9. Commit, push, PR

```powershell
git add .
git commit -m "feat(living-docs): permite reordenar operacoes no editor"
git push -u origin feat/reordenar-operacoes
```

Abra o PR no GitHub e confira se o CI ficou verde.

## Checklist antes do PR

- [ ] `npm run ci` verde
- [ ] Teste novo cobrindo o comportamento novo
- [ ] Sem `console.log` esquecido
- [ ] Sem segredo em código (`.env.local` nunca é commitado)
- [ ] Documentação atualizada se mudou estrutura (`docs/`)
- [ ] Mensagem de commit com prefixo (`feat:`, `fix:`…)

## Exemplo real deste projeto

Feature: "editar o título do manual na própria tela" (Fase 6.2)

| Camada | Arquivo |
| --- | --- |
| schema | `schema/manual.ts` → `updateManualMetadataInputSchema` |
| service | `services/manage-manual-metadata.ts` |
| teste | `services/manage-manual-metadata.test.ts` |
| rota | `app/api/living-docs/projects/[slug]/manual/route.ts` |
| UI | `ui/admin/manual-header-form.tsx` |

Note que **um recurso atravessa as camadas de dentro para fora** — sempre nessa ordem.

↩ [[00-PAINEL-ESTUDOS|Painel de estudos]]
