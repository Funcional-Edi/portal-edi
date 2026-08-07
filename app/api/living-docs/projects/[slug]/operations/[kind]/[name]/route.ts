import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import { manualOperationKindSchema } from "@/modules/living-docs-externa/schema/manual";
import {
  ManageOperationError,
  removeManualOperation,
  updateManualOperation,
} from "@/modules/living-docs-externa/services/manage-manual-operations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    return null;
  }
  return session;
}

const STATUS_BY_ERROR_CODE: Record<ManageOperationError["code"], number> = {
  VALIDATION: 400,
  PROJECT_NOT_FOUND: 404,
  OPERATION_NOT_FOUND: 404,
  OPERATION_ALREADY_EXISTS: 409,
};

interface RouteParams {
  params: Promise<{ slug: string; kind: string; name: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug, kind, name } = await params;
  const kindResult = manualOperationKindSchema.safeParse(kind);
  if (!kindResult.success) {
    return NextResponse.json({ error: "Tipo de operação inválido." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    const operation = await updateManualOperation(slug, kindResult.data, name, body);
    return NextResponse.json(operation);
  } catch (error) {
    if (error instanceof ManageOperationError) {
      return NextResponse.json(
        { error: error.message },
        { status: STATUS_BY_ERROR_CODE[error.code] }
      );
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug, kind, name } = await params;
  const kindResult = manualOperationKindSchema.safeParse(kind);
  if (!kindResult.success) {
    return NextResponse.json({ error: "Tipo de operação inválido." }, { status: 400 });
  }

  try {
    await removeManualOperation(slug, kindResult.data, name);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ManageOperationError) {
      return NextResponse.json(
        { error: error.message },
        { status: STATUS_BY_ERROR_CODE[error.code] }
      );
    }
    throw error;
  }
}
