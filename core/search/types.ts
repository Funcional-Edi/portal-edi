export type SearchResultType = "manual" | "operation" | "section" | "guide";

export interface SearchResult {
  type: SearchResultType;
  title: string;
  href: string;
  snippet?: string;
}

/** Entrada interna do índice Fuse (campos extras para ranking). */
export interface SearchIndexEntry extends SearchResult {
  keywords: string;
}

export const SEARCH_RESULT_TYPE_LABELS: Record<SearchResultType, string> = {
  manual: "Manual",
  operation: "Operação",
  section: "Seção",
  guide: "Guia interno",
};
