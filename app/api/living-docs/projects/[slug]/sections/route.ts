import { NextResponse } from "next/server";

import { requireContentEditor } from "@/core/auth/require-role";
import {
  ManageSectionError,
  addManualSection,
  listDraftManualSections,
} from "@/modules/living-docs-externa/services/manage-manual-sections";

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
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await requireContentEditor();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;

  try {
    const sections = await listDraftManualSections(slug);
    return NextResponse.json({ sections });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await requireContentEditor();
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
    const section = await addManualSection(slug, body);
    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
