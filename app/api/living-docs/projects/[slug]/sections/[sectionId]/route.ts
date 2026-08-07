import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import {
  ManageSectionError,
  removeManualSection,
  updateManualSectionBody,
} from "@/modules/living-docs-externa/services/manage-manual-sections";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    return null;
  }
  return session;
}

const STATUS_BY_ERROR_CODE: Record<ManageSectionError["code"], number> = {
  VALIDATION: 400,
  PROJECT_NOT_FOUND: 404,
  SECTION_NOT_FOUND: 404,
  SECTION_ALREADY_EXISTS: 409,
};

function errorResponse(error: unknown) {
  if (error instanceof ManageSectionError) {
    return NextResponse.json(
      { error: error.message },
      { status: STATUS_BY_ERROR_CODE[error.code] }
    );
  }
  throw error;
}

interface RouteParams {
  params: Promise<{ slug: string; sectionId: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug, sectionId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    const section = await updateManualSectionBody(slug, sectionId, body);
    return NextResponse.json(section);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug, sectionId } = await params;

  try {
    await removeManualSection(slug, sectionId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
