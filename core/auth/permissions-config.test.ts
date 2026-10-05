import { afterEach, describe, expect, it } from "vitest";

import {
  getPermissionsConfig,
  getPermissionsConfigSource,
} from "@/core/auth/permissions-config";
import { resolveRole } from "@/core/auth/roles";

describe("permissions-config", () => {
  const originalEnvJson = process.env.PERMISSIONS_CONFIG_JSON;

  afterEach(() => {
    if (originalEnvJson === undefined) delete process.env.PERMISSIONS_CONFIG_JSON;
    else process.env.PERMISSIONS_CONFIG_JSON = originalEnvJson;
  });

  it("usa defaults quando env ausente", () => {
    delete process.env.PERMISSIONS_CONFIG_JSON;
    expect(getPermissionsConfigSource()).toBe("default");
    expect(resolveRole("admin@empresa.com", getPermissionsConfig())).toBe("client");
  });

  it("lê admins de PERMISSIONS_CONFIG_JSON", () => {
    process.env.PERMISSIONS_CONFIG_JSON = JSON.stringify({
      admins: ["chefe@empresa.com"],
      clients: ["@distribuidor.com"],
      defaultRole: "client",
    });
    const config = getPermissionsConfig();
    expect(getPermissionsConfigSource()).toBe("env");
    expect(resolveRole("chefe@empresa.com", config)).toBe("admin");
    expect(resolveRole("user@distribuidor.com", config)).toBe("client");
  });

  it("lê editors por e-mail exato e aceita config sem editors", () => {
    process.env.PERMISSIONS_CONFIG_JSON = JSON.stringify({
      admins: ["chefe@empresa.com"],
      editors: ["ed@empresa.com"],
      clients: [],
      defaultRole: "client",
    });
    expect(resolveRole("ed@empresa.com", getPermissionsConfig())).toBe("editor");

    process.env.PERMISSIONS_CONFIG_JSON = JSON.stringify({
      admins: ["chefe@empresa.com"],
      clients: [],
      defaultRole: "client",
    });
    expect(getPermissionsConfigSource()).toBe("env");
    expect(getPermissionsConfig().editors).toEqual([]);
  });

  it("chave legada reviewers é ignorada: quem estava lá vira client", () => {
    process.env.PERMISSIONS_CONFIG_JSON = JSON.stringify({
      admins: ["chefe@empresa.com"],
      reviewers: ["rev@empresa.com"],
      clients: [],
      defaultRole: "client",
    });
    expect(getPermissionsConfigSource()).toBe("env");
    expect(resolveRole("rev@empresa.com", getPermissionsConfig())).toBe("client");
  });

  it("editors com @dominio invalidam o config (fallback para defaults)", () => {
    process.env.PERMISSIONS_CONFIG_JSON = JSON.stringify({
      admins: ["chefe@empresa.com"],
      editors: ["@empresa.com"],
      clients: [],
      defaultRole: "client",
    });
    expect(getPermissionsConfigSource()).toBe("default");
  });
});
