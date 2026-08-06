import { listGuideSummaries } from "@/modules/manuais-internos/repository/guide-repository";
import type { InternoGuideSummary } from "@/modules/manuais-internos/schema/guide";

/** Lista guias internos disponíveis para o time EDI. */
export async function listInternoGuides(): Promise<InternoGuideSummary[]> {
  return listGuideSummaries();
}
