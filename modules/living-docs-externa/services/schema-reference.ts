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

export interface SchemaTypeNameRef {
  /** Tipo nomeado interno (null para LIST/NON_NULL). */
  namedType: string | null;
  /** Representação GraphQL legível, ex.: `[String!]!`. */
  formatted: string;
}

export interface SchemaArgDetail {
  name: string;
  description?: string;
  defaultValue?: string;
  type: SchemaTypeNameRef;
}

export interface SchemaFieldDetail {
  name: string;
  description?: string;
  args: SchemaArgDetail[];
  returnType: SchemaTypeNameRef;
  isDeprecated?: boolean;
  deprecationReason?: string;
}

export interface SchemaInputFieldDetail {
  name: string;
  description?: string;
  defaultValue?: string;
  type: SchemaTypeNameRef;
}

export interface SchemaEnumValueDetail {
  name: string;
  description?: string;
  isDeprecated?: boolean;
  deprecationReason?: string;
}

export interface SchemaTypeDetailView {
  name: string;
  kind: string;
  description?: string;
  fields?: SchemaFieldDetail[];
  inputFields?: SchemaInputFieldDetail[];
  enumValues?: SchemaEnumValueDetail[];
  possibleTypes?: string[];
  interfaces?: string[];
}

type IntrospectionTypeRef = {
  kind: string;
  name?: string | null;
  ofType?: IntrospectionTypeRef | null;
};

type IntrospectionArg = {
  name: string;
  description?: string | null;
  defaultValue?: string | null;
  type?: IntrospectionTypeRef | null;
};

type IntrospectionField = {
  name: string;
  description?: string | null;
  args?: IntrospectionArg[] | null;
  type?: IntrospectionTypeRef | null;
  isDeprecated?: boolean | null;
  deprecationReason?: string | null;
};

type IntrospectionInputField = {
  name: string;
  description?: string | null;
  defaultValue?: string | null;
  type?: IntrospectionTypeRef | null;
};

type IntrospectionEnumValue = {
  name: string;
  description?: string | null;
  isDeprecated?: boolean | null;
  deprecationReason?: string | null;
};

type IntrospectionNamedTypeRef = {
  kind: string;
  name?: string | null;
  ofType?: IntrospectionNamedTypeRef | null;
};

type IntrospectionType = {
  kind: string;
  name?: string | null;
  description?: string | null;
  fields?: IntrospectionField[] | null;
  inputFields?: IntrospectionInputField[] | null;
  enumValues?: IntrospectionEnumValue[] | null;
  possibleTypes?: IntrospectionNamedTypeRef[] | null;
  interfaces?: IntrospectionNamedTypeRef[] | null;
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

/** Resolve o tipo nomeado interno (ignora LIST/NON_NULL). */
export function resolveNamedType(
  typeRef: IntrospectionTypeRef | null | undefined
): string | null {
  if (!typeRef) return null;
  if (typeRef.kind === "NON_NULL" || typeRef.kind === "LIST") {
    return resolveNamedType(typeRef.ofType);
  }
  return typeRef.name ?? null;
}

/** Formata referência de tipo GraphQL para exibição. */
export function formatGraphQLType(
  typeRef: IntrospectionTypeRef | null | undefined
): string {
  if (!typeRef) return "Unknown";
  if (typeRef.kind === "NON_NULL") {
    return `${formatGraphQLType(typeRef.ofType)}!`;
  }
  if (typeRef.kind === "LIST") {
    return `[${formatGraphQLType(typeRef.ofType)}]`;
  }
  return typeRef.name ?? typeRef.kind;
}

function toTypeNameRef(
  typeRef: IntrospectionTypeRef | null | undefined
): SchemaTypeNameRef {
  return {
    namedType: resolveNamedType(typeRef),
    formatted: formatGraphQLType(typeRef),
  };
}

function mapArgs(args: IntrospectionArg[] | null | undefined): SchemaArgDetail[] {
  if (!args?.length) return [];
  return args
    .map((arg) => ({
      name: arg.name,
      description: arg.description ?? undefined,
      defaultValue: arg.defaultValue ?? undefined,
      type: toTypeNameRef(arg.type),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function mapFieldDetails(fields: IntrospectionField[] | null | undefined): SchemaFieldDetail[] {
  if (!fields?.length) return [];
  return fields
    .map((field) => ({
      name: field.name,
      description: field.description ?? undefined,
      args: mapArgs(field.args),
      returnType: toTypeNameRef(field.type),
      isDeprecated: field.isDeprecated ?? undefined,
      deprecationReason: field.deprecationReason ?? undefined,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function mapInputFields(
  fields: IntrospectionInputField[] | null | undefined
): SchemaInputFieldDetail[] {
  if (!fields?.length) return [];
  return fields
    .map((field) => ({
      name: field.name,
      description: field.description ?? undefined,
      defaultValue: field.defaultValue ?? undefined,
      type: toTypeNameRef(field.type),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function mapEnumValues(
  values: IntrospectionEnumValue[] | null | undefined
): SchemaEnumValueDetail[] {
  if (!values?.length) return [];
  return values
    .map((value) => ({
      name: value.name,
      description: value.description ?? undefined,
      isDeprecated: value.isDeprecated ?? undefined,
      deprecationReason: value.deprecationReason ?? undefined,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function mapNamedTypeList(
  refs: IntrospectionNamedTypeRef[] | null | undefined
): string[] {
  if (!refs?.length) return [];
  return refs
    .map((ref) => resolveNamedType(ref))
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b));
}

function findTypeByName(
  types: IntrospectionType[],
  typeName: string
): IntrospectionType | null {
  return types.find((type) => type.name === typeName) ?? null;
}

/** Extrai detalhe de um tipo do snapshot (campos, args, enums, etc.). */
export function buildSchemaTypeDetailView(
  snapshot: ProjectSchemaSnapshot,
  typeName: string
): SchemaTypeDetailView | null {
  if (!typeName || typeName.startsWith("__")) return null;

  const types = (snapshot.introspection.__schema.types ?? []) as IntrospectionType[];
  const type = findTypeByName(types, typeName);
  if (!type?.name) return null;

  const detail: SchemaTypeDetailView = {
    name: type.name,
    kind: type.kind,
    description: type.description ?? undefined,
  };

  if (type.fields?.length) {
    detail.fields = mapFieldDetails(type.fields);
  }
  if (type.inputFields?.length) {
    detail.inputFields = mapInputFields(type.inputFields);
  }
  if (type.enumValues?.length) {
    detail.enumValues = mapEnumValues(type.enumValues);
  }

  const possibleTypes = mapNamedTypeList(type.possibleTypes);
  if (possibleTypes.length) detail.possibleTypes = possibleTypes;

  const interfaces = mapNamedTypeList(type.interfaces);
  if (interfaces.length) detail.interfaces = interfaces;

  return detail;
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
