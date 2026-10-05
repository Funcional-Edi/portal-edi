import { listFaqEntries } from "@/modules/faq/repository/faq-repository";
import type { FaqEntry } from "@/modules/faq/schema/faq";

/** Retorna somente respostas publicadas e com corpo disponível. */
export async function listPublishedFaq(): Promise<FaqEntry[]> {
  return listFaqEntries();
}
