import { describe, it, expect } from "vitest";

import { getComplianceReport } from "@/modules/compliance/services/get-compliance-report";
import { COMPLIANCE_CONTROLS } from "@/modules/compliance/data/controls";

describe("getComplianceReport", () => {
  it("retorna catálogo de controles e resumo", () => {
    const report = getComplianceReport();

    expect(report.controls).toHaveLength(COMPLIANCE_CONTROLS.length);
    expect(report.summary.totalControls).toBe(COMPLIANCE_CONTROLS.length);
    expect(report.categories.length).toBeGreaterThan(0);
    expect(report.runtimeChecks.length).toBeGreaterThan(0);
  });

  it("inclui controle de playground admin-only", () => {
    const report = getComplianceReport();
    const playground = report.controls.find((c) => c.id === "playground-admin-only");

    expect(playground).toBeDefined();
    expect(playground?.status).toBe("ativo");
  });
});
