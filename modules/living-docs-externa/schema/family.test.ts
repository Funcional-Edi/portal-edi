import { describe, expect, it } from "vitest";

import {
  PRODUCT_FAMILY_METADATA,
  PRODUCT_FAMILY_ORDER,
  productFamilySchema,
} from "@/modules/living-docs-externa/schema/family";

describe("productFamilySchema", () => {
  it("aceita os valores conhecidos", () => {
    expect(productFamilySchema.safeParse("edi-pharma").success).toBe(true);
    expect(productFamilySchema.safeParse("edi-varejo").success).toBe(true);
  });

  it("rejeita valores desconhecidos", () => {
    expect(productFamilySchema.safeParse("edi-inexistente").success).toBe(false);
  });
});

describe("PRODUCT_FAMILY_METADATA / PRODUCT_FAMILY_ORDER", () => {
  it("tem uma entrada de metadata para cada família do enum", () => {
    for (const family of PRODUCT_FAMILY_ORDER) {
      expect(PRODUCT_FAMILY_METADATA[family]).toBeDefined();
      expect(PRODUCT_FAMILY_METADATA[family].name.length).toBeGreaterThan(0);
    }
  });

  it("ordena EDI Pharma antes de EDI Varejo", () => {
    expect(PRODUCT_FAMILY_ORDER).toEqual(["edi-pharma", "edi-varejo"]);
  });
});
