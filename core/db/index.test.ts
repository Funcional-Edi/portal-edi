import { describe, it, expect } from "vitest";
import {
  isDatabaseAvailable,
  requireDatabase,
  DatabaseRequiredError,
} from "@/core/db";

describe("camada de dados — alerta de banco", () => {
  it("considera 'content' disponível na fundação stateless", () => {
    expect(isDatabaseAvailable("content")).toBe(true);
  });

  it("considera capacidades transacionais indisponíveis hoje", () => {
    expect(isDatabaseAvailable("transactional")).toBe(false);
    expect(isDatabaseAvailable("audit-log")).toBe(false);
    expect(isDatabaseAvailable("vector-search")).toBe(false);
  });

  it("não bloqueia recurso que usa apenas 'content'", () => {
    expect(() => requireDatabase("manual publicado", "content")).not.toThrow();
  });

  it("ALERTA (lança erro) quando um recurso exige banco indisponível", () => {
    expect(() => requireDatabase("homologação", "transactional")).toThrowError(
      DatabaseRequiredError
    );
  });

  it("o erro de banco carrega recurso, capacidade e status 501", () => {
    try {
      requireDatabase("trilha de auditoria", "audit-log");
      expect.unreachable("deveria ter lançado DatabaseRequiredError");
    } catch (err) {
      const e = err as DatabaseRequiredError;
      expect(e.code).toBe("database_required");
      expect(e.httpStatus).toBe(501);
      expect(e.feature).toBe("trilha de auditoria");
      expect(e.capability).toBe("audit-log");
      expect(e.message).toMatch(/adr/i);
    }
  });
});
