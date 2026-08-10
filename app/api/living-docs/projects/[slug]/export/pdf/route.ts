import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import {
  buildManualPdf,
  pdfDownloadFilename,
} from "@/modules/living-docs-externa/services/export-pdf";
import {
  ExportAccessError,
  resolveProjectForExport,
} from "@/modules/living-docs-externa/services/resolve-project-for-export";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const STATUS_BY_ERROR_CODE: Record<ExportAccessError["code"], number> = {
  PROJECT_NOT_FOUND: 404,
  NOT_PUBLISHED: 403,
};

/** Exporta PDF leve do manual curado (download em arquivo). */
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const isAdmin = isAdminRole(session.user.role);

  try {
    const { project } = await resolveProjectForExport(slug, { isAdmin });
    const payload = buildManualPdf(project.config, project.manual);
    const filename = pdfDownloadFilename(slug);

    return new NextResponse(new Uint8Array(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof ExportAccessError) {
      return NextResponse.json(
        { error: error.message },
        { status: STATUS_BY_ERROR_CODE[error.code] }
      );
    }
    throw error;
  }
}
