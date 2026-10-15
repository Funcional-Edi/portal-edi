import { describe, expect, it } from "vitest";

import { buildAccessList, AccessListError, pickPortalList, portalBucketsAfterLeaving } from "@/core/auth/access-list";
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

  it("guarda cada SSO com a própria lista", () => {
    const saved = {
      admins: ["antigo@empresa.com"],
      editors: [],
      ssoPortals: [
        {
          url: "https://sso-homologa.funcionalhealth.com.br/graphql/",
          admins: ["sfoliveira@funcionalcorp.com.br"],
          editors: ["mlima@funcionalcorp.com.br"],
        },
      ],
    };
    expect(pickPortalList(saved, "https://sso-homologa.funcionalhealth.com.br/graphql")).toEqual({
      admins: ["sfoliveira@funcionalcorp.com.br"],
      editors: ["mlima@funcionalcorp.com.br"],
    });
    expect(pickPortalList(saved, "https://sso-novo.funcionalhealth.com.br/graphql/")).toEqual({
      admins: [],
      editors: [],
    });
  });

  it("prende a lista antiga no SSO que está saindo", () => {
    const saved = { admins: ["admin@funcionalcorp.com.br"], editors: [] as string[] };
    const people = { admins: ["admin@funcionalcorp.com.br"], editors: [] as string[] };
    expect(
      portalBucketsAfterLeaving(
        saved,
        "https://sso-homologa.funcionalhealth.com.br/graphql/",
        "https://sso-novo.funcionalhealth.com.br/graphql/",
        people
      )
    ).toEqual([
      {
        url: "https://sso-homologa.funcionalhealth.com.br/graphql/",
        admins: ["admin@funcionalcorp.com.br"],
        editors: [],
      },
    ]);
    expect(
      portalBucketsAfterLeaving(
        saved,
        "https://sso-homologa.funcionalhealth.com.br/graphql/",
        "https://sso-homologa.funcionalhealth.com.br/graphql",
        people
      )
    ).toBeNull();
  });

  it("recusa domínio e lista sem admin", () => {
    expect(() => buildAccessList(current, { admins: ["@empresa.com"], editors: [] })).toThrow(AccessListError);
    expect(() => buildAccessList(current, { admins: [], editors: ["edi@empresa.com"] })).toThrow(
      /pelo menos um admin/
    );
  });
});
