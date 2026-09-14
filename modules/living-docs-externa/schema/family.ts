import { z } from "zod";

/**
 * Família de produto (agrupamento visual no catálogo/admin — não afeta rotas
 * nem credenciais, que continuam por projeto). Adicionar uma família nova é
 * só um valor no enum + uma entrada no registry abaixo.
 */
export const productFamilySchema = z.enum(["edi-pharma", "edi-varejo"]);

export type ProductFamily = z.infer<typeof productFamilySchema>;

export interface ProductFamilyMetadata {
  name: string;
  description: string;
  /** Ordem de exibição no catálogo (menor = primeiro). */
  order: number;
}

export const PRODUCT_FAMILY_METADATA: Record<ProductFamily, ProductFamilyMetadata> = {
  "edi-pharma": {
    name: "EDI Pharma",
    description: "Integrações de indústria e distribuidor farmacêutico (estoque, pedidos).",
    order: 1,
  },
  "edi-varejo": {
    name: "EDI Varejo",
    description: "Integrações de canais de varejo (credenciamento, benefício, PSP/PBM).",
    order: 2,
  },
};

export const PRODUCT_FAMILY_ORDER: ProductFamily[] = (
  Object.keys(PRODUCT_FAMILY_METADATA) as ProductFamily[]
).sort((a, b) => PRODUCT_FAMILY_METADATA[a].order - PRODUCT_FAMILY_METADATA[b].order);
