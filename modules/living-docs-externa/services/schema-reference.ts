import type { ProjectSchemaSnapshot } from "@/modules/living-docs-externa/schema/introspection";

export interface SchemaFieldRef {
  name: string;
  description?: string;
}

export interface SchemaTypeRef {
  kind: string;
  name: string;
  fieldCount: number;
  description?: string;
}

export interface SchemaReferenceView {
  queryTypeName: string | null;
  mutationTypeName: string | null;
  queries: SchemaFieldRef[];
  mutations: SchemaFieldRef[];
  types: SchemaTypeRef[];
}

type IntrospectionField = {
  name: string;
  description?: string | null;
};

type IntrospectionType = {
  kind: string;
  name?: string | null;
  description?: string | null;
  fields?: IntrospectionField[] | null;
};

function mapFields(fields: IntrospectionField[] | null | undefined): SchemaFieldRef[] {
  if (!fields?.length) return [];
  return fields
    .map((field) => ({
      name: field.name,
      description: field.description ?? undefined,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function findRootType(
  types: IntrospectionType[],
  typeName: string | null | undefined
): IntrospectionType | null {
  if (!typeName) return null;
  return types.find((type) => type.name === typeName) ?? null;
}

/** Ancora HTML para deep link a um campo raiz do schema. */
export function schemaFieldAnchor(kind: "query" | "mutation", name: string): string {
  return `${kind}-${name}`;
}

/** Transforma snapshot de introspection em visão navegável (queries, mutations, tipos). */
export function buildSchemaReferenceView(
  snapshot: ProjectSchemaSnapshot
): SchemaReferenceView {
  const schema = snapshot.introspection.__schema;
  const types = (schema.types ?? []) as IntrospectionType[];
  const queryType = findRootType(types, schema.queryType?.name);
  const mutationType = findRootType(types, schema.mutationType?.name);

  const visibleTypes = types
    .filter((type) => type.name && !type.name.startsWith("__"))
    .map((type) => ({
      kind: type.kind,
      name: type.name!,
      fieldCount: type.fields?.length ?? 0,
      description: type.description ?? undefined,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    queryTypeName: schema.queryType?.name ?? null,
    mutationTypeName: schema.mutationType?.name ?? null,
    queries: mapFields(queryType?.fields),
    mutations: mapFields(mutationType?.fields),
    types: visibleTypes,
  };
}
