import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import {
  buildInsomniaExport,
  insomniaDownloadFilename,
} from "@/modules/living-docs-externa/services/export-insomnia";
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

/** Exporta workspace Insomnia v4 do manual curado (JSON download). */
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const isAdmin = isAdminRole(session.user.role);

  try {
    const { project } = await resolveProjectForExport(slug, { isAdmin });
    const payload = buildInsomniaExport(project.config, project.manual);
    const filename = insomniaDownloadFilename(slug);

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
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
    if (error instanceof Error && error.message === "GRAPHQL_URL_REQUIRED") {
      return NextResponse.json(
        { error: "Projeto ainda não possui URL GraphQL configurada." },
        { status: 409 }
      );
    }
    throw error;
  }
}
