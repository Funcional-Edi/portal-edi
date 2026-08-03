import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import { getManualQualityReport } from "@/modules/living-docs-externa/services/manual-quality";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    return null;
  }
  return session;
}

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/** Checklist de qualidade do manual — usado pelo editor antes de publicar. */
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;
  const report = await getManualQualityReport(slug);

  if (!report) {
    return NextResponse.json({ error: `Projeto "${slug}" não encontrado.` }, { status: 404 });
  }

  return NextResponse.json(report);
}
