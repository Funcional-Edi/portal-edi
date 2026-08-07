import { z } from "zod";

export const guideSlugSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens");

export const internoGuideSchema = z.object({
  slug: guideSlugSchema,
  title: z.string().min(1),
  body: z.string(),
});

export type InternoGuide = z.infer<typeof internoGuideSchema>;

export function titleFromMarkdown(body: string, fallbackSlug: string): string {
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallbackSlug;
}

export interface InternoGuideSummary {
  slug: string;
  title: string;
}
