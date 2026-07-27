/**
 * Regras de arquitetura VERIFICADAS POR MÁQUINA.
 *
 * A estrutura do portal só se sustenta se a regra de dependência for validada
 * automaticamente. Aqui ela deixa de ser "combinado do time" e vira gate de CI:
 *
 *     app/  →  modules/  →  core/
 *
 * Violar qualquer regra abaixo quebra o build (`npm run arch`).
 * Ver docs/arquitetura/adr/0006-arquitetura-enforcada.md
 */

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "core-nao-depende-de-modules",
      comment:
        "core/ é a fundação (invariante). Se ele conhecesse um módulo, deixaria " +
        "de ser reutilizável e criaria dependência circular entre camadas.",
      severity: "error",
      from: { path: "^core/" },
      to: { path: "^modules/" },
    },
    {
      name: "core-nao-depende-de-app",
      comment:
        "core/ não pode conhecer a camada de entrada (rotas/telas). Regra de " +
        "negócio e fundação não conhecem framework de UI.",
      severity: "error",
      from: { path: "^core/" },
      to: { path: "^app/" },
    },
    {
      name: "modules-nao-dependem-de-app",
      comment:
        "Um módulo não pode importar de app/. A dependência é sempre app → modules.",
      severity: "error",
      from: { path: "^modules/" },
      to: { path: "^app/" },
    },
    {
      name: "modulos-nao-se-importam",
      comment:
        "Bounded contexts são isolados: um módulo NUNCA importa outro módulo. " +
        "A comunicação entre contextos é por eventos (core/events). " +
        "Exceção: modules/registry.ts, que só faz o wiring central.",
      severity: "error",
      from: { path: "^modules/([^/]+)/" },
      to: {
        path: "^modules/([^/]+)/",
        pathNot: "^modules/$1/",
      },
    },
    {
      name: "sem-ciclos",
      comment:
        "Dependência circular torna o código impossível de raciocinar e de testar isoladamente.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "sem-imports-quebrados",
      comment: "Import que não resolve.",
      severity: "error",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "sem-dependencia-de-devDependencies",
      comment:
        "Código de produção não pode depender de devDependencies (quebra em runtime).",
      severity: "error",
      from: { path: "^(app|core|modules)/", pathNot: "\\.test\\.ts$" },
      to: { dependencyTypes: ["npm-dev"] },
    },
  ],

  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "node_modules|\\.next|coverage" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    reporterOptions: {
      dot: { collapsePattern: "^(app|core|modules)/[^/]+" },
      archi: { collapsePattern: "^(app|core|modules)/[^/]+" },
    },
  },
};
