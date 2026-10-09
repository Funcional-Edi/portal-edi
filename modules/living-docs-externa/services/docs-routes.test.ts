import { describe, expect, it } from "vitest";

import {
  DOCS_HOME_HREF,
  docsJourneyHref,
  docsReturnHref,
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
    expect(docsJourneyHref("im")).toBe("/docs/im#jornada-integracao");
    expect(docsOperationHref("im", "mutation", "createToken")).toBe(
      "/docs/im/operations/mutation/createToken"
    );
  });

  it("preserva o retorno para uma etapa da jornada e rejeita destinos externos", () => {
    const returnTo = "/docs/im#jornada-operacao-2";
    expect(docsReturnHref("im", returnTo)).toBe(returnTo);
    expect(docsReturnHref("im", "https://example.com")).toBe(
      "/docs/im#jornada-integracao"
    );
  });

  it("monta URL do playground com query codificada", () => {
    expect(docsPlaygroundHref("im")).toBe("/docs/im/playground");
    const href = docsPlaygroundHref("im", "query { ping }");
    expect(href).toBe("/docs/im/playground?query=query%20%7B%20ping%20%7D");
  });
});
