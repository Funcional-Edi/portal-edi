import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { getProject } from "@/modules/living-docs-externa/repository/project-repository";

import {
  createManualOperationInputSchema,
  integrationManualSchema,
  manualOperationSchema,
} from "@/modules/living-docs-externa/schema/manual";

describe("manualOperationSchema", () => {
  it("aceita operação query/mutation sem method/path", () => {
    const result = manualOperationSchema.safeParse({
      kind: "query",
      name: "listItems",
      order: 1,
    });
    expect(result.success).toBe(true);
  });

  it("aceita operação rest com method e path", () => {
    const result = manualOperationSchema.safeParse({
      kind: "rest",
      name: "autoriza",
      order: 1,
      method: "POST",
      path: "/wsAutorizacao/service.asmx/Autoriza",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita operação rest sem method", () => {
    const result = manualOperationSchema.safeParse({
      kind: "rest",
      name: "autoriza",
      order: 1,
      path: "/wsAutorizacao/service.asmx/Autoriza",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("method"))).toBe(true);
    }
  });

  it("rejeita operação rest sem path", () => {
    const result = manualOperationSchema.safeParse({
      kind: "rest",
      name: "autoriza",
      order: 1,
      method: "POST",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("path"))).toBe(true);
    }
  });
});

describe("createManualOperationInputSchema", () => {
  it("mantém a exigência de method/path para rest na entrada de criação", () => {
    const result = createManualOperationInputSchema.safeParse({
      kind: "rest",
      name: "autoriza",
      method: "POST",
    });
    expect(result.success).toBe(false);
  });

  it("aceita rest com order omitido (auto-atribuído)", () => {
    const result = createManualOperationInputSchema.safeParse({
      kind: "rest",
      name: "autoriza",
      method: "GET",
      path: "/status",
    });
    expect(result.success).toBe(true);
  });
});

describe("integrationManualSchema", () => {
  it("carrega os cenários de homologação do projeto publicado", async () => {
    const project = await getProject("canal-autorizador");

    expect(project?.manual.homologationFlows?.flatMap((flow) => flow.scenarios)).not.toHaveLength(0);
  });

  it("preserva os cenários de homologação publicados do Canal Autorizador", () => {
    const raw = JSON.parse(readFileSync(resolve(process.cwd(), "content/projects/canal-autorizador/manual.json"), "utf8")) as unknown;
    const result = integrationManualSchema.safeParse(raw);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.homologationFlows?.flatMap((flow) => flow.scenarios)).not.toHaveLength(0);
    }
  });

  it("aceita tabelas por operação e cenários de homologação", () => {
    const result = integrationManualSchema.safeParse({
      version: 1,
      title: "Canal Autorizador",
      referenceTables: [{ id: "order-status", title: "Status", columns: ["Código"], rows: [["OK"]] }],
      homologationFlows: [{
        title: "Fluxo Normal",
        scenarios: [{
          title: "Pedido faturado",
          preconditions: ["Pedido válido"],
          operations: ["createGroupedOrder"],
          expectedResult: "Pedido processado",
          evidence: ["Resposta da API"],
          approval: "Registrar para homologação",
        }],
      }],
      operations: [{
        kind: "mutation",
        name: "createGroupedOrder",
        order: 1,
        referenceTableIds: ["order-status"],
      }],
    });
    expect(result.success).toBe(true);
  });
});
