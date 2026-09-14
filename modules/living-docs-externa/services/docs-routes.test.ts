import { describe, expect, it } from "vitest";

import {
  DOCS_HOME_HREF,
  docsFamilyHref,
  docsGuideHref,
  docsOperationHref,
  docsPlaygroundHref,
} from "@/modules/living-docs-externa/services/docs-routes";

describe("docs-routes", () => {
  it("monta URLs públicas da documentação curada", () => {
    expect(DOCS_HOME_HREF).toBe("/docs");
    expect(docsFamilyHref("edi-pharma")).toBe("/docs/edi-pharma");
    expect(docsGuideHref("im")).toBe("/docs/im");
    expect(docsOperationHref("im", "mutation", "createToken")).toBe(
      "/docs/im/operations/mutation/createToken"
    );
  });

  it("monta URL do playground com query codificada", () => {
    expect(docsPlaygroundHref("im")).toBe("/docs/im/playground");
    const href = docsPlaygroundHref("im", "query { ping }");
    expect(href).toBe("/docs/im/playground?query=query%20%7B%20ping%20%7D");
  });
});
