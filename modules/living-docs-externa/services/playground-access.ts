/** Monta URL do playground com query opcional pré-preenchida. */
export function buildPlaygroundHref(slug: string, query?: string): string {
  const base = `/manual/${slug}/playground`;
  if (!query?.trim()) return base;
  return `${base}?query=${encodeURIComponent(query)}`;
}
