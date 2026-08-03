import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import type {
  IntegrationManual,
  ManualSection,
  ProjectConfig,
} from "@/modules/living-docs-externa/schema";
import { createProject, writeManual } from "@/modules/living-docs-externa/repository/project-repository";
import { writeManualSection } from "@/modules/living-docs-externa/repository/section-repository";
import {
  evaluateManualQuality,
  getManualQualityReport,
  type ManualQualityReport,
  type ManualQualityStatus,
} from "@/modules/living-docs-externa/services/manual-quality";

const baseConfig: ProjectConfig = {
  slug: "demo",
  name: "Demo",
  graphqlUrl: "https://gateway.example.com/graphql",
  published: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const goodSection: ManualSection = {
  id: "visao-geral",
  title: "Visão geral",
  body: "# Visão geral\n\nEste manual descreve a integração de demonstração com detalhe suficiente para o distribuidor.\n",
};

const baseManual: IntegrationManual = {
  version: 1,
  title: "Integração Demo",
  productName: "Demo Gateway",
  operations: [
    {
      kind: "query",
      name: "listItems",
      order: 1,
      description: "Lista os itens disponíveis.",
      exampleQuery: "query listItems { listItems { id } }",
    },
  ],
};

function statusOf(report: ManualQualityReport, checkId: string): ManualQualityStatus {
  const check = report.checks.find((item) => item.id === checkId);
  if (!check) throw new Error(`Check "${checkId}" não existe no relatório.`);
  return check.status;
}

describe("evaluateManualQuality", () => {
  it("aprova um manual completo", () => {
    const report = evaluateManualQuality({
      config: baseConfig,
      manual: baseManual,
      sections: [goodSection],
    });

    expect(report.readyToPublish).toBe(true);
    expect(report.failed).toBe(0);
    expect(report.warnings).toBe(0);
    expect(report.slug).toBe("demo");
  });

  it("reprova título ainda no padrão gerado por createProject", () => {
    const report = evaluateManualQuality({
      config: baseConfig,
      manual: { ...baseManual, title: "Manual de integração — Demo" },
      sections: [goodSection],
    });

    expect(statusOf(report, "titulo")).toBe("fail");
    expect(report.readyToPublish).toBe(false);
  });

  it("reprova manual sem nenhuma seção de contexto", () => {
    const report = evaluateManualQuality({
      config: baseConfig,
      manual: baseManual,
      sections: [],
    });

    expect(statusOf(report, "contexto")).toBe("fail");
    expect(report.readyToPublish).toBe(false);
  });

  it("reprova seção curta ou sem título `#`", () => {
    const semTitulo = evaluateManualQuality({
      config: baseConfig,
      manual: baseManual,
      sections: [{ ...goodSection, body: goodSection.body.replace("# Visão geral\n\n", "") }],
    });
    expect(statusOf(semTitulo, "secoes-com-conteudo")).toBe("fail");

    const curta = evaluateManualQuality({
      config: baseConfig,
      manual: baseManual,
      sections: [{ ...goodSection, body: "# Vazia\n" }],
    });
    expect(statusOf(curta, "secoes-com-conteudo")).toBe("fail");
    expect(curta.checks.find((c) => c.id === "secoes-com-conteudo")?.detail).toContain(
      "visao-geral"
    );
  });

  it("reprova roteiro vazio e operação sem descrição", () => {
    const semOperacoes = evaluateManualQuality({
      config: baseConfig,
      manual: { ...baseManual, operations: [] },
      sections: [goodSection],
    });
    expect(statusOf(semOperacoes, "operacoes")).toBe("fail");

    const semDescricao = evaluateManualQuality({
      config: baseConfig,
      manual: {
        ...baseManual,
        operations: [{ kind: "query", name: "listItems", order: 1, exampleQuery: "query {}" }],
      },
      sections: [goodSection],
    });
    expect(statusOf(semDescricao, "operacoes-descritas")).toBe("fail");
    expect(semDescricao.checks.find((c) => c.id === "operacoes-descritas")?.detail).toContain(
      "query:listItems"
    );
  });

  it("reprova ordem duplicada entre operações", () => {
    const report = evaluateManualQuality({
      config: baseConfig,
      manual: {
        ...baseManual,
        operations: [
          { kind: "query", name: "a", order: 1, description: "A", exampleQuery: "query {}" },
          { kind: "query", name: "b", order: 1, description: "B", exampleQuery: "query {}" },
        ],
      },
      sections: [goodSection],
    });

    expect(statusOf(report, "ordem-unica")).toBe("fail");
  });

  it("reprova relatedSections apontando para seção inexistente", () => {
    const report = evaluateManualQuality({
      config: baseConfig,
      manual: {
        ...baseManual,
        operations: [
          {
            ...baseManual.operations[0],
            relatedSections: ["visao-geral", "nao-existe"],
          },
        ],
      },
      sections: [goodSection],
    });

    expect(statusOf(report, "secoes-relacionadas")).toBe("fail");
    expect(report.checks.find((c) => c.id === "secoes-relacionadas")?.detail).toContain(
      "nao-existe"
    );
  });

  it("apenas avisa (sem bloquear) sobre produto, exemplo e gateway ausentes", () => {
    const { graphqlUrl: _graphqlUrl, ...configSemGateway } = baseConfig;

    const report = evaluateManualQuality({
      config: configSemGateway,
      manual: {
        ...baseManual,
        productName: undefined,
        operations: [{ kind: "query", name: "listItems", order: 1, description: "Lista." }],
      },
      sections: [goodSection],
    });

    expect(statusOf(report, "produto")).toBe("warn");
    expect(statusOf(report, "operacoes-exemplo")).toBe("warn");
    expect(statusOf(report, "gateway")).toBe("warn");
    expect(report.warnings).toBe(3);
    expect(report.readyToPublish).toBe(true);
  });
});

describe("getManualQualityReport", () => {
  let tempRoot: string;
  const originalContentRoot = process.env.CONTENT_ROOT;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "portal-edi-quality-"));
    process.env.CONTENT_ROOT = tempRoot;
    revalidateTagMock.mockClear();

    await createProject({ slug: "demo", name: "Demo" });
  });

  afterEach(async () => {
    if (originalContentRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = originalContentRoot;

    await rm(tempRoot, { recursive: true, force: true });
  });

  it("retorna null para projeto inexistente", async () => {
    expect(await getManualQualityReport("nao-existe")).toBeNull();
  });

  it("reprova o projeto recém-criado (manual ainda vazio)", async () => {
    const report = await getManualQualityReport("demo");

    expect(report?.readyToPublish).toBe(false);
    expect(statusOf(report!, "titulo")).toBe("fail");
    expect(statusOf(report!, "contexto")).toBe("fail");
    expect(statusOf(report!, "operacoes")).toBe("fail");
  });

  it("aprova após preencher manual e seção no CMS", async () => {
    await writeManual("demo", baseManual);
    await writeManualSection("demo", goodSection.id, goodSection.body);

    const report = await getManualQualityReport("demo");

    expect(report?.readyToPublish).toBe(true);
    expect(report?.failed).toBe(0);
  });
});
