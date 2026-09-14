import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

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
});

describe("permissions-loader (arquivo)", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-permissions-"));
    process.env.CONTENT_ROOT = tempRoot;
    delete process.env.PERMISSIONS_CONFIG_JSON;
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;
    await rm(tempRoot, { recursive: true, force: true });
  });

  it("prioriza data/permissions.json sobre env", async () => {
    process.env.PERMISSIONS_CONFIG_JSON = JSON.stringify({
      admins: ["env@empresa.com"],
      clients: [],
      defaultRole: "client",
    });

    const dataDir = path.join(tempRoot, "data");
    await mkdir(dataDir, { recursive: true });
    await writeFile(
      path.join(dataDir, "permissions.json"),
      JSON.stringify({
        admins: ["file@empresa.com"],
        clients: [],
        defaultRole: "client",
      }),
      "utf8"
    );

    const { getEffectivePermissionsConfig, getEffectivePermissionsSource } =
      await import("@/core/auth/permissions-loader");

    expect(getEffectivePermissionsSource()).toBe("file");
    expect(resolveRole("file@empresa.com", getEffectivePermissionsConfig())).toBe(
      "admin"
    );
  });
});
