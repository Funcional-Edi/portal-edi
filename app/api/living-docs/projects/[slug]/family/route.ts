import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import {
  UpdateProjectFamilyError,
  setProjectFamily,
} from "@/modules/living-docs-externa/services/update-project-family";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    return null;
  }
  return session;
}

const STATUS_BY_ERROR_CODE: Record<UpdateProjectFamilyError["code"], number> = {
  VALIDATION: 400,
  PROJECT_NOT_FOUND: 404,
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
    const config = await setProjectFamily(slug, body);
    return NextResponse.json({
      slug: config.slug,
      family: config.family,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    if (error instanceof UpdateProjectFamilyError) {
      return NextResponse.json(
        { error: error.message },
        { status: STATUS_BY_ERROR_CODE[error.code] }
      );
    }
    throw error;
  }
}
