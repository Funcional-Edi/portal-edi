import { describe, expect, it } from "vitest";

import { buildManualPdf, pdfDownloadFilename } from "@/modules/living-docs-externa/services/export-pdf";
import type { IntegrationManual } from "@/modules/living-docs-externa/schema/manual";
import type { ProjectConfig } from "@/modules/living-docs-externa/schema/project";

const baseConfig: ProjectConfig = {
  slug: "demo",
  name: "Demo API",
  description: "Projeto de demonstração para validar export PDF.",
  environment: "homolog",
  protocol: "graphql",
  graphqlUrl: "https://gateway-homologa.fidelize.com.br/graphql",
  published: true,
  audience: "distribuidor",
  createdAt: "2026-08-01T10:00:00.000Z",
  updatedAt: "2026-08-01T10:00:00.000Z",
};

const baseManual: IntegrationManual = {
  version: 1,
  title: "Manual Demo",
  manualVersion: "1.0.0",
  operations: [
    {
      kind: "mutation",
      name: "createToken",
      order: 1,
      title: "1. Obter token",
      description: "Autentica no gateway.",
      exampleQuery: "mutation { createToken(login: \"demo\", password: \"demo\") { token } }",
    },
  ],
};

describe("buildManualPdf", () => {
  it("gera binário PDF com assinatura e conteúdo do manual", () => {
    const buffer = buildManualPdf(baseConfig, baseManual);
    const text = buffer.toString("utf8");

    expect(buffer.byteLength).toBeGreaterThan(500);
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("Manual de Integracao - Manual Demo");
    expect(text).toContain("createToken");
    expect(text).toContain("xref");
    expect(text).toContain("%%EOF");
  });

  it("gera nome de arquivo com slug", () => {
    expect(pdfDownloadFilename("im")).toBe("im-manual.pdf");
  });
});
