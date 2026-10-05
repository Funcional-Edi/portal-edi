import { NextResponse } from "next/server";

import { requireAdmin } from "@/core/auth/require-role";
import { PublishProjectError, setProjectPublished } from "@/modules/living-docs-externa/services/publish-project";

const STATUS_BY_ERROR_CODE: Record<PublishProjectError["code"], number> = {
  VALIDATION: 400,
  PROJECT_NOT_FOUND: 404,
  /** Checklist de qualidade reprovado: requisição bem formada, estado inválido. */
  QUALITY_GATE: 422,
};

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    const config = await setProjectPublished(slug, body);
    return NextResponse.json({
      slug: config.slug,
      published: config.published,
      manualStatus: config.manualStatus,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    if (error instanceof PublishProjectError) {
      return NextResponse.json(
        { error: error.message, report: error.report },
        { status: STATUS_BY_ERROR_CODE[error.code] }
      );
    }
    throw error;
  }
}
