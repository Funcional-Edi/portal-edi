import { describe, it, expect } from "vitest";
import {
  resolveRole,
  isAdminRole,
  canEditContent,
  isInternalStaffRole,
  DEFAULT_PERMISSIONS_CONFIG,
  type PermissionsConfig,
} from "@/core/auth/roles";

describe("RBAC — resolução de papel", () => {
  it("reconhece admin pela lista de permissões padrão", () => {
    expect(resolveRole("admin@funcionalcorp.com.br")).toBe("admin");
  });

  it("é insensível a maiúsculas no e-mail", () => {
    const config: PermissionsConfig = {
      admins: ["admin@empresa.com"],
      editors: [],
      clients: [],
      defaultRole: "admin",
    };

    expect(resolveRole("ADMIN@EMPRESA.COM", config)).toBe("admin");
  });

  it("trata qualquer outro e-mail como client (papel padrão)", () => {
    expect(resolveRole("distribuidor@parceiro.com")).toBe("client");
    expect(resolveRole("admin@empresa.com")).toBe("client");
  });

  it("usa o papel padrão quando não há e-mail", () => {
    expect(resolveRole(null)).toBe("client");
    expect(resolveRole(undefined)).toBe("client");
  });

  it("aceita regra de client por domínio", () => {
    const config: PermissionsConfig = {
      admins: [],
      editors: [],
      clients: ["@parceiro.com"],
      defaultRole: "client",
    };
    expect(resolveRole("qualquer@parceiro.com", config)).toBe("client");
  });

  it("admin tem precedência sobre regra de client", () => {
    const config: PermissionsConfig = {
      admins: ["chefe@empresa.com"],
      editors: [],
      clients: ["@empresa.com"],
      defaultRole: "client",
    };
    expect(resolveRole("chefe@empresa.com", config)).toBe("admin");
  });

  it("isAdminRole distingue os papéis", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("client")).toBe(false);
  });

  it("o padrão do sistema é o menor privilégio (client)", () => {
    expect(DEFAULT_PERMISSIONS_CONFIG.defaultRole).toBe("client");
  });

  describe("editor EDI", () => {
    const config: PermissionsConfig = {
      admins: ["chefe@empresa.com"],
      editors: ["ed@empresa.com", "chefe@empresa.com"],
      clients: ["@empresa.com"],
      defaultRole: "client",
    };

    it("resolve por e-mail exato (case-insensitive)", () => {
      expect(resolveRole("ED@empresa.com", config)).toBe("editor");
      expect(resolveRole("ed2@empresa.com", config)).toBe("client");
    });

    it("precedência: admin > editor > client", () => {
      expect(resolveRole("chefe@empresa.com", config)).toBe("admin");
    });

    it("nunca casa editor por domínio", () => {
      const byDomain = { ...config, editors: ["@empresa.com"] };
      expect(resolveRole("qualquer@empresa.com", byDomain)).toBe("client");
    });

    it("helpers de papel", () => {
      expect(isAdminRole("editor")).toBe(false);
      expect(canEditContent("admin") && canEditContent("editor")).toBe(true);
      expect(canEditContent("client")).toBe(false);
      expect(isInternalStaffRole("editor")).toBe(true);
      expect(isInternalStaffRole("client")).toBe(false);
    });
  });
});
