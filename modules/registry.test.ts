import { describe, it, expect } from "vitest";
import { registerAllModules, listBlockedModules } from "@/modules/registry";

describe("registro de módulos do portal", () => {
  it("registra todos os módulos previstos sem conflito de id", () => {
    const modulos = registerAllModules();
    const ids = modulos.map((m) => m.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("living-docs-externa");
    expect(ids).toContain("homologacao");
    expect(ids).toContain("compliance");
  });

  it("é idempotente — registrar duas vezes não duplica nem quebra", () => {
    registerAllModules();
    const segunda = registerAllModules();

    expect(segunda).toHaveLength(6);
  });

  it("sinaliza homologação como bloqueada por exigir banco transacional", () => {
    const bloqueados = listBlockedModules();
    const homologacao = bloqueados.find((b) => b.module.id === "homologacao");

    expect(homologacao?.missing).toContain("transactional");
    expect(homologacao?.missing).toContain("audit-log");
  });

  it("sinaliza o assistente de IA como bloqueado por exigir busca vetorial", () => {
    const assistente = listBlockedModules().find(
      (b) => b.module.id === "assistente-ia"
    );

    expect(assistente?.missing).toContain("vector-search");
  });

  it("não bloqueia módulos que usam apenas conteúdo versionável", () => {
    const ids = listBlockedModules().map((b) => b.module.id);

    expect(ids).not.toContain("living-docs-externa");
    expect(ids).not.toContain("manuais-internos");
    expect(ids).not.toContain("fluxogramas");
  });

  it("todo módulo declara rota base, público e nível de acesso", () => {
    for (const modulo of registerAllModules()) {
      expect(modulo.basePath).toMatch(/^\//);
      expect(["interno", "externo", "ambos"]).toContain(modulo.audience);
      expect(["admin", "client", "any"]).toContain(modulo.access);
    }
  });
});
