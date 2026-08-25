export type SearchResultType =
  | "manual"
  | "operation"
  | "section"
  | "guide"
  | "schema-field"
  | "schema-type";

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
  "schema-field": "Schema",
  "schema-type": "Tipo GraphQL",
};
