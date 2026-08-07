import { afterEach, describe, expect, it } from "vitest";

import {
  getPlaygroundMetricsSnapshot,
  recordPlaygroundExecution,
  resetPlaygroundMetricsStore,
} from "@/core/metrics/playground-metrics-store";

describe("playground-metrics-store", () => {
  afterEach(() => {
    resetPlaygroundMetricsStore();
  });

  it("incrementa contador por operação", () => {
    recordPlaygroundExecution({
      slug: "demo",
      operationKind: "mutation",
      operationName: "createToken",
    });
    recordPlaygroundExecution({
      slug: "demo",
      operationKind: "mutation",
      operationName: "createToken",
    });

    const snapshot = getPlaygroundMetricsSnapshot();
    expect(snapshot.totalExecutions).toBe(2);
    expect(snapshot.byOperation).toHaveLength(1);
    expect(snapshot.byOperation[0]?.total).toBe(2);
    expect(snapshot.byProject[0]?.slug).toBe("demo");
  });

  it("reseta store entre testes via setup", () => {
    expect(getPlaygroundMetricsSnapshot().totalExecutions).toBe(0);
  });
});
