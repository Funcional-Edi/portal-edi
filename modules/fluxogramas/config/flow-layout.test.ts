import { describe, expect, it } from "vitest";

import {
  FLOW_LAYOUT_DEFAULTS,
  nextLinearNodePosition,
} from "@/modules/fluxogramas/config/flow-layout";

describe("nextLinearNodePosition", () => {
  it("insere o próximo nó à direita, sem empilhá-lo sobre a linha atual", () => {
    expect(
      nextLinearNodePosition([
        { position: { x: 80, y: 160 } },
        { position: { x: 340, y: 160 } },
      ])
    ).toEqual({ x: 660, y: 160 });
  });

  it("preserva um corredor após o nó mais à direita de um fluxo curado", () => {
    expect(
      nextLinearNodePosition([{ position: { x: 4100, y: 560 } }])
    ).toEqual({ x: 4420, y: FLOW_LAYOUT_DEFAULTS.newNodePosition.y });
  });
});
