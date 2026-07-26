import { describe, it, expect, beforeEach } from "vitest";
import {
  registerModule,
  listModules,
  listActiveModules,
  getModule,
  resetModuleRegistry,
  type PortalModule,
} from "@/core/module-registry";

const moduloAtivo: PortalModule = {
  id: "teste-ativo",
  title: "Teste Ativo",
  description: "Módulo de teste ativo.",
  status: "active",
  basePath: "/teste",
  access: "any",
  audience: "interno",
};

const moduloPlanejado: PortalModule = {
  ...moduloAtivo,
  id: "teste-planejado",
  status: "planned",
};

describe("module-registry", () => {
  beforeEach(() => resetModuleRegistry());

  it("registra e recupera um módulo pelo id", () => {
    registerModule(moduloAtivo);
    expect(getModule("teste-ativo")).toEqual(moduloAtivo);
  });

  it("impede registrar dois módulos com o mesmo id", () => {
    registerModule(moduloAtivo);
    expect(() => registerModule(moduloAtivo)).toThrowError(/já registrado/i);
  });

  it("lista apenas módulos ativos em listActiveModules", () => {
    registerModule(moduloAtivo);
    registerModule(moduloPlanejado);

    expect(listModules()).toHaveLength(2);
    expect(listActiveModules().map((m) => m.id)).toEqual(["teste-ativo"]);
  });

  it("retorna undefined para módulo inexistente", () => {
    expect(getModule("nao-existe")).toBeUndefined();
  });
});
