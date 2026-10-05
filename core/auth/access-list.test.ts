import { describe, expect, it } from "vitest";

import { buildAccessList, AccessListError } from "@/core/auth/access-list";
import type { PermissionsConfig } from "@/core/auth/roles";

const current: PermissionsConfig = {
  admins: ["admin@empresa.com"],
  editors: [],
  clients: ["@distribuidor.com"],
  defaultRole: "client",
};

describe("buildAccessList", () => {
  it("grava e-mail exato e mantém quem já é cliente", () => {
    const next = buildAccessList(current, {
      admins: ["Chefe@Empresa.com"],
      editors: ["edi@empresa.com"],
    });
    expect(next.admins).toEqual(["chefe@empresa.com"]);
    expect(next.editors).toEqual(["edi@empresa.com"]);
    expect(next.clients).toEqual(["@distribuidor.com"]);
  });

  it("recusa domínio e lista sem admin", () => {
    expect(() => buildAccessList(current, { admins: ["@empresa.com"], editors: [] })).toThrow(AccessListError);
    expect(() => buildAccessList(current, { admins: [], editors: ["edi@empresa.com"] })).toThrow(
      /pelo menos um admin/
    );
  });
});
