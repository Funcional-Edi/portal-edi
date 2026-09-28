import {
  faqAnswerPath,
  faqIndexPath,
} from "@/core/db/adapters/content-paths";
import { readContentJson, readContentText } from "@/core/db/adapters";
import {
  faqIndexSchema,
  faqSlugSchema,
  type FaqEntry,
  type FaqIndexItem,
} from "@/modules/faq/schema/faq";

async function readIndex(): Promise<FaqIndexItem[]> {
  const raw = await readContentJson<unknown>(faqIndexPath());
  const result = faqIndexSchema.safeParse(raw);
  if (!result.success) return [];

  return result.data.items
    .filter((item) => item.status === "published")
    .sort((a, b) => a.order - b.order || a.question.localeCompare(b.question, "pt-BR"));
}

export async function listFaqEntries(): Promise<FaqEntry[]> {
  const items = await readIndex();
  const entries = await Promise.all(items.map((item) => getFaqEntry(item.slug, items)));
  return entries.filter((entry): entry is FaqEntry => entry !== null);
}

export async function getFaqEntry(
  slug: string,
  indexItems?: FaqIndexItem[],
): Promise<FaqEntry | null> {
  if (!faqSlugSchema.safeParse(slug).success) return null;

  const item = (indexItems ?? await readIndex()).find((candidate) => candidate.slug === slug);
  if (!item) return null;

  const body = await readContentText(faqAnswerPath(slug));
  if (body === null) return null;

  return { ...item, body };
}
