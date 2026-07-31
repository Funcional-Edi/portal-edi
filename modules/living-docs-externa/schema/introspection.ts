import { z } from "zod";

import { slugSchema } from "@/modules/living-docs-externa/schema/project";

const introspectionFieldSchema = z
  .object({
    name: z.string().min(1),
  })
  .passthrough();

const introspectionTypeSchema = z
  .object({
    kind: z.string().min(1),
    name: z.string().min(1).nullable().optional(),
    fields: z.array(introspectionFieldSchema).nullable().optional(),
  })
  .passthrough();

export const introspectionPayloadSchema = z
  .object({
    __schema: z
      .object({
        queryType: z
          .object({
            name: z.string().min(1),
          })
          .nullable(),
        mutationType: z
          .object({
            name: z.string().min(1),
          })
          .nullable(),
        types: z.array(introspectionTypeSchema),
      })
      .passthrough(),
  })
  .passthrough();

export const projectSchemaSnapshotSchema = z.object({
  version: z.literal(1),
  syncedAt: z.string().datetime(),
  source: z.object({
    projectSlug: slugSchema,
    graphqlUrl: z.string().url(),
    gatewaySlug: z.string().min(1).max(128).optional(),
  }),
  introspection: introspectionPayloadSchema,
  summary: z.object({
    typeCount: z.number().int().nonnegative(),
    queryFieldCount: z.number().int().nonnegative(),
    mutationFieldCount: z.number().int().nonnegative(),
  }),
});

export type IntrospectionPayload = z.infer<typeof introspectionPayloadSchema>;
export type ProjectSchemaSnapshot = z.infer<typeof projectSchemaSnapshotSchema>;
