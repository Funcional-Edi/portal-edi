const CACHE_NAMESPACE = "living-docs";

export const LIVING_DOCS_CACHE_KEYS = {
  listPublishedManuals: "list-published-manuals",
  getPublishedManual: "get-published-manual",
  getPublishedManualSections: "get-published-manual-sections",
  listPublishedSchemaCatalog: "list-published-schema-catalog",
  getPublishedSchemaReference: "get-published-schema-reference",
  getPublishedSchemaTypeDetail: "get-published-schema-type-detail",
  hasPublishedSchemaSnapshot: "has-published-schema-snapshot",
} as const;

export const LIVING_DOCS_CACHE_TAGS = {
  projects: `${CACHE_NAMESPACE}:projects`,
  project(slug: string): string {
    return `${CACHE_NAMESPACE}:project:${slug}`;
  },
} as const;
