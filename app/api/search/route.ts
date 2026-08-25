import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import { searchIndex } from "@/core/search/fuse-search";
import { buildLivingDocsSearchIndex } from "@/modules/living-docs-externa/services/build-search-index";
import { buildSchemaSearchIndex } from "@/modules/living-docs-externa/services/build-schema-search-index";

/** Busca global no portal (manuais, operações, seções, schema GraphQL). Respeita RBAC. */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const isAdmin = isAdminRole(session.user.role);

  const [livingDocsEntries, schemaEntries] = await Promise.all([
    buildLivingDocsSearchIndex(isAdmin),
    buildSchemaSearchIndex(),
  ]);

  let guideEntries: Awaited<
    ReturnType<typeof import("@/modules/manuais-internos/services/build-search-index").buildInternoSearchIndex>
  > = [];

  if (isAdmin) {
    const { buildInternoSearchIndex } = await import(
      "@/modules/manuais-internos/services/build-search-index"
    );
    guideEntries = await buildInternoSearchIndex();
  }

  const results = searchIndex([...livingDocsEntries, ...schemaEntries, ...guideEntries], query);

  return NextResponse.json({ results });
}
