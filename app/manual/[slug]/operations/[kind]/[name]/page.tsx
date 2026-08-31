import { notFound } from "next/navigation";

import { auth, isAdminRole } from "@/core/auth";
import {
  findOperation,
  manualOperationKindSchema,
} from "@/modules/living-docs-externa/schema";
import { OperationDetail } from "@/modules/living-docs-externa/ui/reader/operation-detail";
import {
  hasPublishedSchemaSnapshot,
  schemaFieldHref,
} from "@/modules/living-docs-externa/services/get-published-schema";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";

interface OperationPageProps {
  params: Promise<{ slug: string; kind: string; name: string }>;
}

export default async function OperationPage({ params }: OperationPageProps) {
  const { slug, kind, name } = await params;
  const kindResult = manualOperationKindSchema.safeParse(kind);
  if (!kindResult.success) notFound();

  const session = await auth();
  const canUsePlayground = Boolean(session?.user?.role && isAdminRole(session.user.role));

  const [project, hasSchema] = await Promise.all([
    getPublishedManual(slug),
    hasPublishedSchemaSnapshot(slug),
  ]);
  if (!project) notFound();

  const operation = findOperation(project.manual, kindResult.data, name);
  if (!operation) notFound();

  const gatewayConnected = Boolean(
    project.config.protocol === "rest" ? project.config.apiBaseUrl : project.config.graphqlUrl
  );
  const kindForSchema = kindResult.data;

  return (
    <OperationDetail
      slug={slug}
      manualTitle={project.manual.title}
      operation={operation}
      gatewayConnected={gatewayConnected}
      schemaFieldHref={
        hasSchema && kindForSchema !== "rest"
          ? schemaFieldHref(slug, kindForSchema, name)
          : undefined
      }
      canUsePlayground={canUsePlayground}
    />
  );
}
