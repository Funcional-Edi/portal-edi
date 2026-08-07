import { getGuide } from "@/modules/manuais-internos/repository/guide-repository";
import type { InternoGuide } from "@/modules/manuais-internos/schema/guide";

/** Carrega um guia interno por slug. */
export async function getInternoGuide(slug: string): Promise<InternoGuide | null> {
  return getGuide(slug);
}
