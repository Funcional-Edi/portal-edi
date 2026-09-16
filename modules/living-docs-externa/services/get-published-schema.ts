import { cachePublishedContent } from "@/modules/living-docs-externa/services/content-cache";
import { cache } from "react";

import { getContentBackend } from "@/core/db/adapters";
import { readProjectSchemaSnapshot } from "@/modules/living-docs-externa/repository/schema-repository";
import type { Project, ProjectSummary } from "@/modules/living-docs-externa/schema";
import {
  LIVING_DOCS_CACHE_KEYS,
  LIVING_DOCS_CACHE_TAGS,
} from "@/modules/living-docs-externa/services/cache-tags";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";
import { listPublishedManuals } from "@/modules/living-docs-externa/services/list-published-manuals";
import {
  buildOperationSchemaDetail,
  buildSchemaReferenceView,
  buildSchemaTypeDetailView,
  type OperationSchemaDetail,
  type SchemaReferenceView,
  type SchemaTypeDetailView,
} from "@/modules/living-docs-externa/services/schema-reference";
import type { ProjectSchemaSnapshot } from "@/modules/living-docs-externa/schema/introspection";

export interface PublishedSchemaReference {
  project: Project;
  snapshot: ProjectSchemaSnapshot;
  reference: SchemaReferenceView;
}

export interface PublishedSchemaTypeDetail {
  project: Project;
  snapshot: ProjectSchemaSnapshot;
  typeDetail: SchemaTypeDetailView;
}

export interface SchemaCatalogEntry extends ProjectSummary {
  hasSchema: boolean;
  syncedAt?: string;
  typeCount?: number;
  queryFieldCount?: number;
  mutationFieldCount?: number;
}

async function loadPublishedSchemaReference(
  slug: string
): Promise<PublishedSchemaReference | null> {
  const project = await getPublishedManual(slug);
  if (!project) return null;

  const snapshot = await readProjectSchemaSnapshot(slug);
  if (!snapshot) return null;

  return {
    project,
    snapshot,
    reference: buildSchemaReferenceView(snapshot),
  };
}

async function loadPublishedSchemaCatalog(): Promise<SchemaCatalogEntry[]> {
  const manuals = await listPublishedManuals();
  const entries = await Promise.all(
    manuals.map(async (manual) => {
      const snapshot = await readProjectSchemaSnapshot(manual.slug);
      return {
        ...manual,
        hasSchema: snapshot !== null,
        syncedAt: snapshot?.syncedAt,
        typeCount: snapshot?.summary.typeCount,
        queryFieldCount: snapshot?.summary.queryFieldCount,
        mutationFieldCount: snapshot?.summary.mutationFieldCount,
      };
    })
  );
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

async function loadPublishedSchemaReferenceCached(
  slug: string
): Promise<PublishedSchemaReference | null> {
  const backend = getContentBackend();
  const getCached = cachePublishedContent(
    async () => loadPublishedSchemaReference(slug),
    [LIVING_DOCS_CACHE_KEYS.getPublishedSchemaReference, backend, slug],
    { tags: [LIVING_DOCS_CACHE_TAGS.project(slug)] }
  );
  return getCached();
}

async function loadPublishedSchemaCatalogCached(): Promise<SchemaCatalogEntry[]> {
  const backend = getContentBackend();
  const getCached = cachePublishedContent(
    async () => loadPublishedSchemaCatalog(),
    [LIVING_DOCS_CACHE_KEYS.listPublishedSchemaCatalog, backend],
    { tags: [LIVING_DOCS_CACHE_TAGS.projects] }
  );
  return getCached();
}

export const getPublishedSchemaReference = cache(loadPublishedSchemaReferenceCached);
export const listPublishedSchemaCatalog = cache(loadPublishedSchemaCatalogCached);

async function loadPublishedSchemaTypeDetail(
  slug: string,
  typeName: string
): Promise<PublishedSchemaTypeDetail | null> {
  const data = await loadPublishedSchemaReference(slug);
  if (!data) return null;

  const typeDetail = buildSchemaTypeDetailView(data.snapshot, typeName);
  if (!typeDetail) return null;

  return {
    project: data.project,
    snapshot: data.snapshot,
    typeDetail,
  };
}

async function loadPublishedSchemaTypeDetailCached(
  slug: string,
  typeName: string
): Promise<PublishedSchemaTypeDetail | null> {
  const backend = getContentBackend();
  const getCached = cachePublishedContent(
    async () => loadPublishedSchemaTypeDetail(slug, typeName),
    [LIVING_DOCS_CACHE_KEYS.getPublishedSchemaTypeDetail, backend, slug, typeName],
    { tags: [LIVING_DOCS_CACHE_TAGS.project(slug)] }
  );
  return getCached();
}

export const getPublishedSchemaTypeDetail = cache(loadPublishedSchemaTypeDetailCached);

async function loadPublishedOperationSchemaDetail(
  slug: string,
  kind: "query" | "mutation",
  operationName: string
): Promise<OperationSchemaDetail | null> {
  const project = await getPublishedManual(slug);
  if (!project) return null;

  const snapshot = await readProjectSchemaSnapshot(slug);
  if (!snapshot) return null;

  return buildOperationSchemaDetail(snapshot, kind, operationName);
}

async function loadPublishedOperationSchemaDetailCached(
  slug: string,
  kind: "query" | "mutation",
  operationName: string
): Promise<OperationSchemaDetail | null> {
  const backend = getContentBackend();
  const getCached = cachePublishedContent(
    async () => loadPublishedOperationSchemaDetail(slug, kind, operationName),
    [
      LIVING_DOCS_CACHE_KEYS.getPublishedOperationSchemaDetail,
      backend,
      slug,
      kind,
      operationName,
    ],
    { tags: [LIVING_DOCS_CACHE_TAGS.project(slug)] }
  );
  return getCached();
}

export const getPublishedOperationSchemaDetail = cache(
  loadPublishedOperationSchemaDetailCached
);

/** Indica se o produto publicado tem snapshot de schema (para links cruzados no manual). */
async function loadHasPublishedSchemaSnapshot(slug: string): Promise<boolean> {
  const project = await getPublishedManual(slug);
  if (!project) return false;
  const snapshot = await readProjectSchemaSnapshot(slug);
  return snapshot !== null;
}

async function loadHasPublishedSchemaSnapshotCached(slug: string): Promise<boolean> {
  const backend = getContentBackend();
  const getCached = cachePublishedContent(
    async () => loadHasPublishedSchemaSnapshot(slug),
    [LIVING_DOCS_CACHE_KEYS.hasPublishedSchemaSnapshot, backend, slug],
    { tags: [LIVING_DOCS_CACHE_TAGS.project(slug)] }
  );
  return getCached();
}

export const hasPublishedSchemaSnapshot = cache(loadHasPublishedSchemaSnapshotCached);

export function schemaReferenceHref(slug: string): string {
  return `/docs/api/${slug}`;
}

export function schemaFieldHref(
  slug: string,
  kind: "query" | "mutation",
  name: string
): string {
  return `/docs/api/${slug}#${kind}-${name}`;
}

export function schemaTypeHref(slug: string, typeName: string): string {
  return `/docs/api/${slug}/types/${encodeURIComponent(typeName)}`;
}
