import { z } from "zod";

export const faqSlugSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens");

export const faqStatusSchema = z.enum(["draft", "review", "published"]);

export const faqCategorySchema = z.string().min(1).max(64);

export const faqLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().regex(/^\//, "FAQ links must be internal paths"),
});

export const faqIndexItemSchema = z.object({
  slug: faqSlugSchema,
  question: z.string().min(1),
  category: faqCategorySchema,
  order: z.number().int().nonnegative(),
  status: faqStatusSchema,
  relatedLinks: z.array(faqLinkSchema).default([]),
});

export const faqIndexSchema = z.object({
  items: z.array(faqIndexItemSchema),
});

export type FaqIndexItem = z.infer<typeof faqIndexItemSchema>;

export interface FaqEntry extends FaqIndexItem {
  body: string;
}
