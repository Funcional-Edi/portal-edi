# Ambiente de desenvolvimento: Node.js e npm

O portal usa Node.js **24.x**. A versão está alinhada entre `.nvmrc`, `package.json`,
CI e Docker. Após trocar de versão do Node, reinstale as dependências a partir do
lockfile antes de iniciar o projeto.

## Windows

Instale o Node.js 24 LTS pelo instalador oficial ou use o NVM for Windows se precisar
alternar entre versões. O arquivo `.nvmrc` informa a versão esperada, mas não instala
o Node automaticamente. Após a instalação, abra um novo PowerShell e confira:

```powershell
node --version
npm.cmd --version
```

O PowerShell pode bloquear o wrapper `npm.ps1` conforme a política de execução da
máquina. Use `npm.cmd` em vez de alterar a política do sistema.

## Instalação limpa das dependências

Execute `npm.cmd ci` quando instalar/trocar o Node ou quando precisar reconstruir
`node_modules` exatamente conforme o `package-lock.json`:

```powershell
npm.cmd ci
```

`npm ci` remove e recria `node_modules`; não atualiza o lockfile. Para o trabalho
diário, não é necessário repeti-lo a cada inicialização. Após a instalação, use:

```powershell
npm.cmd run dev
```

Ao alterar dependências intencionalmente, use `npm.cmd install <pacote>` e versione
juntos `package.json` e `package-lock.json`.

## Antes de enviar alterações

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:e2e
```

O E2E usa uma instância isolada na porta 3003 por padrão; não encerre o servidor de
desenvolvimento da porta 3002 para executar os testes.
