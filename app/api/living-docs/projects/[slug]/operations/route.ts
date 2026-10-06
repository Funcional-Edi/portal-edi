import { NextResponse } from "next/server";

import { requireContentEditor } from "@/core/auth/require-role";
import {
  ManageOperationError,
  addManualOperation,
} from "@/modules/living-docs-externa/services/manage-manual-operations";

const STATUS_BY_ERROR_CODE: Record<ManageOperationError["code"], number> = {
  VALIDATION: 400,
  PROJECT_NOT_FOUND: 404,
  OPERATION_NOT_FOUND: 404,
  OPERATION_ALREADY_EXISTS: 409,
};

interface RouteParams {
  params: Promise<{ slug: string }>;
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
    const operation = await addManualOperation(slug, body);
    return NextResponse.json(operation, { status: 201 });
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
