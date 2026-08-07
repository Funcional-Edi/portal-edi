import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import { searchIndex } from "@/core/search/fuse-search";
import { buildLivingDocsSearchIndex } from "@/modules/living-docs-externa/services/build-search-index";

/** Busca global no portal (manuais, operações, seções). Respeita RBAC. */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const isAdmin = isAdminRole(session.user.role);

  const livingDocsEntries = await buildLivingDocsSearchIndex(isAdmin);

  let guideEntries: Awaited<
    ReturnType<typeof import("@/modules/manuais-internos/services/build-search-index").buildInternoSearchIndex>
  > = [];

  if (isAdmin) {
    const { buildInternoSearchIndex } = await import(
      "@/modules/manuais-internos/services/build-search-index"
    );
    guideEntries = await buildInternoSearchIndex();
  }

  const results = searchIndex([...livingDocsEntries, ...guideEntries], query);

  return NextResponse.json({ results });
}
