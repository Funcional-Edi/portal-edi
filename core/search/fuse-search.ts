import Fuse, { type IFuseOptions } from "fuse.js";

import type { SearchIndexEntry, SearchResult } from "@/core/search/types";

const FUSE_OPTIONS: IFuseOptions<SearchIndexEntry> = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "keywords", weight: 0.3 },
    { name: "snippet", weight: 0.2 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

/** Busca fuzzy sobre um índice pré-montado (sem I/O). */
export function searchIndex(
  entries: SearchIndexEntry[],
  query: string,
  limit = 20
): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed || entries.length === 0) return [];

  const fuse = new Fuse(entries, FUSE_OPTIONS);
  return fuse.search(trimmed, { limit }).map(({ item }) => ({
    type: item.type,
    title: item.title,
    href: item.href,
    snippet: item.snippet,
  }));
}
