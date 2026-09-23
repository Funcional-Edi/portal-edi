# Configuração do CodeGraph

## Objetivo

Este repositório usa o CodeGraph para mapear símbolos, rotas e relações entre os módulos. O índice permite investigar o fluxo real antes de alterar código e deve ser mantido atualizado em cada ambiente de desenvolvimento.

## Pré requisitos

- Node.js entre as versões 20 e 21
- npm
- acesso ao repositório local

## Configuração inicial

Na raiz do repositório, instale a mesma versão do CLI usada pelo projeto:

```bash
npm install -g @colbymchenry/codegraph@1.6.0
```

Se a pasta `.codegraph/` ainda não existir, crie o índice inicial:

```bash
codegraph init .
```

Se a pasta já existir, faça apenas a sincronização incremental:

```bash
codegraph sync .
```

Valide a instalação:

```bash
codegraph version
codegraph status .
```

O status esperado termina com `Index is up to date`.

## Configuração dos agentes

O Codex usa `.codex/config.toml`, que inicia o servidor MCP com:

```toml
[mcp_servers.codegraph]
command = "codegraph"
args = ["serve", "--mcp"]
```

O Cursor usa `.cursor/mcp.json`. Como alguns ambientes iniciam o MCP fora da raiz do projeto, o arquivo informa explicitamente o caminho do repositório. Ao abrir o projeto em outra máquina, atualize o valor de `--path` para o caminho local dessa máquina.

Depois de instalar ou atualizar o CLI, reinicie o agente para que ele carregue o servidor MCP novamente.

## Rotina de atualização

Depois de alterar arquivos do projeto:

```bash
codegraph sync .
codegraph status .
```

Antes de investigar uma rota ou um símbolo, prefira:

```bash
codegraph explore "rota de documentação Canal Autorizador índices operações"
```

Use `codegraph index .` somente quando for necessário reconstruir o índice completo. Em caso de bloqueio de lock antigo, use `codegraph unlock .` e repita a sincronização.

## Checklist para um novo ambiente

1. Instalar as dependências do projeto com `npm install`.
2. Instalar o CodeGraph na versão `1.6.0`.
3. Executar `codegraph init .` se `.codegraph/` não existir; caso contrário, executar `codegraph sync .`.
4. Confirmar `codegraph status .` com o índice atualizado.
5. Conferir o caminho `--path` em `.cursor/mcp.json`.
6. Reiniciar o Codex ou o Cursor para carregar o MCP.

