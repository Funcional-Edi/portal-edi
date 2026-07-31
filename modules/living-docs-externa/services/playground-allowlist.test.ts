import { describe, expect, it } from "vitest";

import type { IntegrationManual } from "@/modules/living-docs-externa/schema/manual";
import {
  PlaygroundAllowlistError,
  validatePlaygroundQuery,
} from "@/modules/living-docs-externa/services/playground-allowlist";

const manual: IntegrationManual = {
  version: 1,
  title: "Manual de teste",
  operations: [
    { kind: "query", name: "listarPedidos", order: 1 },
    { kind: "mutation", name: "criarPedido", order: 2 },
  ],
};

describe("validatePlaygroundQuery", () => {
  it("aceita query allowlisted", () => {
    const result = validatePlaygroundQuery(manual, "query { listarPedidos { id } }");
    expect(result).toEqual({ kind: "query", operationNames: ["listarPedidos"] });
  });

  it("aceita mutation allowlisted", () => {
    const result = validatePlaygroundQuery(
      manual,
      "mutation { criarPedido(input: { id: 1 }) { id } }"
    );
    expect(result).toEqual({ kind: "mutation", operationNames: ["criarPedido"] });
  });

  it("aceita query nomeada (named operation) allowlisted", () => {
    const result = validatePlaygroundQuery(
      manual,
      "query ListarPedidos { listarPedidos { id status } }"
    );
    expect(result.operationNames).toEqual(["listarPedidos"]);
  });

  it("aceita múltiplos campos raiz quando todos estão na allowlist", () => {
    const multiManual: IntegrationManual = {
      ...manual,
      operations: [...manual.operations, { kind: "query", name: "listarClientes", order: 3 }],
    };
    const result = validatePlaygroundQuery(
      multiManual,
      "query { listarPedidos { id } listarClientes { id } }"
    );
    expect(result.operationNames).toEqual(["listarPedidos", "listarClientes"]);
  });

  it("rejeita operação fora da allowlist", () => {
    expect(() => validatePlaygroundQuery(manual, "query { operacaoInexistente { id } }")).toThrow(
      PlaygroundAllowlistError
    );
    try {
      validatePlaygroundQuery(manual, "query { operacaoInexistente { id } }");
      throw new Error("deveria ter lançado");
    } catch (error) {
      expect(error).toBeInstanceOf(PlaygroundAllowlistError);
      expect((error as PlaygroundAllowlistError).code).toBe("OPERATION_NOT_ALLOWLISTED");
    }
  });

  it("rejeita mutation cujo nome só existe como query na allowlist", () => {
    expect(() =>
      validatePlaygroundQuery(manual, "mutation { listarPedidos { id } }")
    ).toThrow(PlaygroundAllowlistError);
  });

  it("rejeita introspection (__schema)", () => {
    try {
      validatePlaygroundQuery(manual, "query { __schema { types { name } } }");
      throw new Error("deveria ter lançado");
    } catch (error) {
      expect(error).toBeInstanceOf(PlaygroundAllowlistError);
      expect((error as PlaygroundAllowlistError).code).toBe("INTROSPECTION_NOT_ALLOWED");
    }
  });

  it("rejeita introspection (__type)", () => {
    expect(() =>
      validatePlaygroundQuery(manual, 'query { __type(name: "Foo") { name } }')
    ).toThrow(PlaygroundAllowlistError);
  });

  it("rejeita subscription", () => {
    try {
      validatePlaygroundQuery(manual, "subscription { listarPedidos { id } }");
      throw new Error("deveria ter lançado");
    } catch (error) {
      expect(error).toBeInstanceOf(PlaygroundAllowlistError);
      expect((error as PlaygroundAllowlistError).code).toBe("SUBSCRIPTION_NOT_ALLOWED");
    }
  });

  it("rejeita query com erro de sintaxe", () => {
    try {
      validatePlaygroundQuery(manual, "query { listarPedidos { ");
      throw new Error("deveria ter lançado");
    } catch (error) {
      expect(error).toBeInstanceOf(PlaygroundAllowlistError);
      expect((error as PlaygroundAllowlistError).code).toBe("INVALID_QUERY");
    }
  });

  it("rejeita documento com múltiplas operações", () => {
    const query = `
      query A { listarPedidos { id } }
      query B { listarPedidos { id } }
    `;
    try {
      validatePlaygroundQuery(manual, query);
      throw new Error("deveria ter lançado");
    } catch (error) {
      expect(error).toBeInstanceOf(PlaygroundAllowlistError);
      expect((error as PlaygroundAllowlistError).code).toBe("MULTIPLE_OPERATIONS_NOT_SUPPORTED");
    }
  });

  it("rejeita documento sem operação (só fragment)", () => {
    const query = `
      fragment PedidoFields on Pedido { id }
    `;
    expect(() => validatePlaygroundQuery(manual, query)).toThrow(PlaygroundAllowlistError);
  });
});
