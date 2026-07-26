import { describe, it, expect } from "vitest";
import {
  resolveRole,
  isAdminRole,
  DEFAULT_PERMISSIONS_CONFIG,
  type PermissionsConfig,
} from "@/core/auth/roles";

describe("RBAC — resolução de papel", () => {
  it("reconhece admin do time EDI pela lista de permissões", () => {
    expect(resolveRole("admin@funcionalcorp.com.br")).toBe("admin");
  });

  it("é insensível a maiúsculas no e-mail", () => {
    expect(resolveRole("ADMIN@FuncionalCorp.com.BR")).toBe("admin");
  });

  it("trata qualquer outro e-mail como client (papel padrão)", () => {
    expect(resolveRole("distribuidor@parceiro.com")).toBe("client");
  });

  it("usa o papel padrão quando não há e-mail", () => {
    expect(resolveRole(null)).toBe("client");
    expect(resolveRole(undefined)).toBe("client");
  });

  it("aceita regra de client por domínio", () => {
    const config: PermissionsConfig = {
      admins: [],
      clients: ["@parceiro.com"],
      defaultRole: "client",
    };
    expect(resolveRole("qualquer@parceiro.com", config)).toBe("client");
  });

  it("admin tem precedência sobre regra de client", () => {
    const config: PermissionsConfig = {
      admins: ["chefe@funcionalcorp.com.br"],
      clients: ["@funcionalcorp.com.br"],
      defaultRole: "client",
    };
    expect(resolveRole("chefe@funcionalcorp.com.br", config)).toBe("admin");
  });

  it("isAdminRole distingue os papéis", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("client")).toBe(false);
  });

  it("o padrão do sistema é o menor privilégio (client)", () => {
    expect(DEFAULT_PERMISSIONS_CONFIG.defaultRole).toBe("client");
  });
});
