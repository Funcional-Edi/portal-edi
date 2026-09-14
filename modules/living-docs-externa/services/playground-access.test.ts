import { describe, expect, it } from "vitest";

import { buildPlaygroundHref } from "@/modules/living-docs-externa/services/playground-access";

describe("buildPlaygroundHref", () => {
  it("monta URL base sem query", () => {
    expect(buildPlaygroundHref("im")).toBe("/docs/im/playground");
  });

  it("codifica query multilinha na URL", () => {
    const query = 'mutation createToken {\n  createToken(login: "x") { token }\n}';
    const href = buildPlaygroundHref("im", query);
    expect(href.startsWith("/docs/im/playground?query=")).toBe(true);
    expect(decodeURIComponent(href.split("query=")[1] ?? "")).toBe(query);
  });
});
