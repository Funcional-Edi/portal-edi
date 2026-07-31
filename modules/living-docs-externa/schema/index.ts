export {
  projectConfigSchema,
  slugSchema,
  connectGatewayInputSchema,
  publishProjectInputSchema,
  type Project,
  type ProjectConfig,
  type ProjectSummary,
  type ConnectGatewayInput,
  type PublishProjectInput,
  toProjectSummary,
} from "@/modules/living-docs-externa/schema/project";

export {
  integrationManualSchema,
  manualOperationSchema,
  manualOperationKindSchema,
  createManualOperationInputSchema,
  updateManualOperationInputSchema,
  findOperation,
  sortOperations,
  type IntegrationManual,
  type ManualOperation,
  type ManualOperationKind,
  type CreateManualOperationInput,
  type UpdateManualOperationInput,
} from "@/modules/living-docs-externa/schema/manual";

export {
  sectionIdSchema,
  manualSectionSchema,
  titleFromMarkdown,
  type ManualSection,
} from "@/modules/living-docs-externa/schema/section";

export {
  introspectionPayloadSchema,
  projectSchemaSnapshotSchema,
  type IntrospectionPayload,
  type ProjectSchemaSnapshot,
} from "@/modules/living-docs-externa/schema/introspection";

export {
  playgroundRequestInputSchema,
  type PlaygroundRequestInput,
} from "@/modules/living-docs-externa/schema/playground";
