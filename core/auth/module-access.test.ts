import { describe, it, expect } from "vitest";

import {
  canAccessModule,
  canAccessPath,
  findModuleForPath,
  isPublicPath,
  isSafeCallbackUrl,
  pathRequiresAuth,
  resolvePostLoginPath,
} from "@/core/auth/module-access";
import type { PortalModule } from "@/core/module-registry";

const manualModule: PortalModule = {
  id: "living-docs-externa",
  title: "Manual",
  description: "Doc externa",
  status: "active",
  basePath: "/docs",
  access: "any",
  audience: "externo",
};

const internoModule: PortalModule = {
  id: "manuais-internos",
  title: "Interno",
  description: "Doc interna",
  status: "planned",
  basePath: "/interno",
  access: "admin",
  audience: "interno",
};

const fluxogramasModule: PortalModule = {
  id: "fluxogramas",
  title: "Fluxogramas",
  description: "Diagramas",
  status: "planned",
  basePath: "/fluxogramas",
  access: "any",
  audience: "ambos",
};

const TEST_MODULES = [manualModule, internoModule, fluxogramasModule];

describe("canAccessModule", () => {
  it("any permite admin e client", () => {
    expect(canAccessModule("admin", manualModule)).toBe(true);
    expect(canAccessModule("client", manualModule)).toBe(true);
  });

  it("admin só permite papel admin", () => {
    expect(canAccessModule("admin", internoModule)).toBe(true);
    expect(canAccessModule("client", internoModule)).toBe(false);
  });
});

describe("findModuleForPath", () => {
  it("resolve o módulo pelo prefixo mais específico", () => {
    expect(findModuleForPath("/docs/im", TEST_MODULES)?.id).toBe("living-docs-externa");
    expect(findModuleForPath("/interno/docs", TEST_MODULES)?.id).toBe("manuais-internos");
  });

  it("retorna undefined para rota sem módulo", () => {
    expect(findModuleForPath("/sobre", TEST_MODULES)).toBeUndefined();
  });
});

describe("canAccessPath", () => {
  it("rotas públicas passam sem sessão", () => {
    expect(canAccessPath(undefined, "/", TEST_MODULES)).toBe(true);
    expect(canAccessPath(undefined, "/login", TEST_MODULES)).toBe(true);
    expect(canAccessPath(undefined, "/api/health", TEST_MODULES)).toBe(true);
  });

  it("client acessa manual mas não admin nem módulos internos", () => {
    expect(canAccessPath("client", "/docs", TEST_MODULES)).toBe(true);
    expect(canAccessPath("client", "/docs/im", TEST_MODULES)).toBe(true);
    expect(canAccessPath("client", "/admin/projects", TEST_MODULES)).toBe(false);
    expect(canAccessPath("client", "/interno", TEST_MODULES)).toBe(false);
  });

  it("admin acessa tudo registrado", () => {
    expect(canAccessPath("admin", "/admin/projects", TEST_MODULES)).toBe(true);
    expect(canAccessPath("admin", "/interno", TEST_MODULES)).toBe(true);
    expect(canAccessPath("admin", "/docs", TEST_MODULES)).toBe(true);
  });

  it("módulo protegido exige login", () => {
    expect(canAccessPath(undefined, "/docs", TEST_MODULES)).toBe(false);
  });
});

describe("pathRequiresAuth", () => {
  it("distingue público de protegido", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(pathRequiresAuth("/", TEST_MODULES)).toBe(false);
    expect(pathRequiresAuth("/docs", TEST_MODULES)).toBe(true);
    expect(pathRequiresAuth("/admin/projects", TEST_MODULES)).toBe(true);
  });
});

describe("resolvePostLoginPath", () => {
  it("admin vai para / por padrão", () => {
    expect(resolvePostLoginPath("admin", null, TEST_MODULES)).toBe("/");
  });

  it("client vai para /docs por padrão", () => {
    expect(resolvePostLoginPath("client", null, TEST_MODULES)).toBe("/docs");
  });

  it("respeita callbackUrl seguro quando permitido", () => {
    expect(resolvePostLoginPath("client", "/docs/im", TEST_MODULES)).toBe("/docs/im");
  });

  it("ignora callbackUrl proibido para o papel", () => {
    expect(resolvePostLoginPath("client", "/admin/projects", TEST_MODULES)).toBe("/docs");
  });
});

describe("isSafeCallbackUrl", () => {
  it("aceita path relativo interno", () => {
    expect(isSafeCallbackUrl("/docs")).toBe(true);
  });

  it("rejeita open redirect", () => {
    expect(isSafeCallbackUrl("//evil.com")).toBe(false);
    expect(isSafeCallbackUrl("https://evil.com")).toBe(false);
  });
});
