import { afterEach, describe, expect, it, vi } from "vitest";

import { getAllowedSsoHosts, validateSsoUrl } from "@/core/auth/sso-config";

describe("sso-config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("recusa URL sem https", () => {
    vi.stubEnv("SSO_URL_ALLOWED_HOSTS", "sso-homologa.funcionalhealth.com.br");
    expect(validateSsoUrl("http://sso-homologa.funcionalhealth.com.br/graphql/")).toMatch(/https/i);
  });

  it("recusa host fora da allowlist", () => {
    vi.stubEnv("SSO_URL_ALLOWED_HOSTS", "sso-homologa.funcionalhealth.com.br");
    expect(validateSsoUrl("https://evil.exemplo.com/graphql/")).toMatch(/allowlist/i);
  });

  it("aceita host da allowlist", () => {
    vi.stubEnv("SSO_URL_ALLOWED_HOSTS", "sso-homologa.funcionalhealth.com.br,sso.funcionalhealth.com.br");
    expect(getAllowedSsoHosts()).toEqual([
      "sso-homologa.funcionalhealth.com.br",
      "sso.funcionalhealth.com.br",
    ]);
    expect(validateSsoUrl("https://sso-homologa.funcionalhealth.com.br/graphql/")).toBeNull();
  });
});
