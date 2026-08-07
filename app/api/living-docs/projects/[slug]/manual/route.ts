import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import {
  ManageMetadataError,
  updateManualMetadata,
} from "@/modules/living-docs-externa/services/manage-manual-metadata";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    return null;
  }
  return session;
}

const STATUS_BY_ERROR_CODE: Record<ManageMetadataError["code"], number> = {
  VALIDATION: 400,
  PROJECT_NOT_FOUND: 404,
};

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/** Atualiza o cabeçalho do manual (título, produto, versão). */
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
    const manual = await updateManualMetadata(slug, body);
    return NextResponse.json({
      title: manual.title,
      productName: manual.productName,
      manualVersion: manual.manualVersion,
    });
  } catch (error) {
    if (error instanceof ManageMetadataError) {
      return NextResponse.json(
        { error: error.message },
        { status: STATUS_BY_ERROR_CODE[error.code] }
      );
    }
    throw error;
  }
}
