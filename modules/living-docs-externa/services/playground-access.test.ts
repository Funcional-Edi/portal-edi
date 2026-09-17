import { describe, expect, it } from "vitest";

import { docsPlaygroundHref } from "@/modules/living-docs-externa/services/docs-routes";

describe("buildPlaygroundHref", () => {
  it("monta URL base sem query", () => {
    expect(docsPlaygroundHref("im")).toBe("/docs/im/playground");
  });

  it("codifica query multilinha na URL", () => {
    const query = 'mutation createToken {\n  createToken(login: "x") { token }\n}';
    const href = docsPlaygroundHref("im", query);
    expect(href.startsWith("/docs/im/playground?query=")).toBe(true);
    expect(decodeURIComponent(href.split("query=")[1] ?? "")).toBe(query);
  });
});
