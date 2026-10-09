import { notFound } from "next/navigation";

import { auth, isAdminRole } from "@/core/auth";
import {
  findOperation,
  manualOperationKindSchema,
} from "@/modules/living-docs-externa/schema";
import { OperationDetail } from "@/modules/living-docs-externa/ui/reader/operation-detail";
import {
  getPublishedOperationSchemaDetail,
  hasPublishedSchemaSnapshot,
  schemaFieldHref,
} from "@/modules/living-docs-externa/services/get-published-schema";
import { docsReturnHref } from "@/modules/living-docs-externa/services/docs-routes";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";

interface OperationPageProps {
  params: Promise<{ slug: string; kind: string; name: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}

export default async function OperationPage({ params, searchParams }: OperationPageProps) {
  const { slug, kind, name } = await params;
  const { returnTo: requestedReturnTo } = await searchParams;
  const kindResult = manualOperationKindSchema.safeParse(kind);
  if (!kindResult.success) notFound();

  const session = await auth();
  const canUsePlayground = Boolean(session?.user?.role && isAdminRole(session.user.role));

  const [project, hasSchema] = await Promise.all([
    getPublishedManual(slug),
    hasPublishedSchemaSnapshot(slug),
  ]);
  if (!project) notFound();
  const returnTo = docsReturnHref(slug, requestedReturnTo);

  const operation = findOperation(project.manual, kindResult.data, name);
  if (!operation) notFound();

  const referenceTables = (project.manual.referenceTables ?? []).filter((table) =>
    operation.referenceTableIds?.includes(table.id)
  );

  const gatewayConnected = Boolean(
    project.config.protocol === "rest" ? project.config.apiBaseUrl : project.config.graphqlUrl
  );
  const kindForSchema = kindResult.data;
  const schemaDetail =
    hasSchema && kindForSchema !== "rest"
      ? await getPublishedOperationSchemaDetail(slug, kindForSchema, name)
      : null;

  return (
    <OperationDetail
      slug={slug}
      manualTitle={project.manual.title}
      operation={operation}
      gatewayConnected={gatewayConnected}
      schemaFieldHref={
        hasSchema && kindForSchema !== "rest"
          ? schemaFieldHref(slug, kindForSchema, name, returnTo)
          : undefined
      }
      schemaDetail={schemaDetail}
      referenceTables={referenceTables}
      canUsePlayground={canUsePlayground}
      importanceNotices={project.config.productId === "credenciado"}
      returnTo={returnTo}
    />
  );
}
