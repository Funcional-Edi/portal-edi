import { NextResponse } from "next/server";

import { requireContentEditor } from "@/core/auth/require-role";
import { SyncSchemaError, syncSchema } from "@/modules/living-docs-externa/services/sync-schema";

const STATUS_BY_ERROR_CODE: Record<SyncSchemaError["code"], number> = {
  PROJECT_NOT_FOUND: 404,
  GATEWAY_NOT_CONNECTED: 409,
  INVALID_URL: 400,
  GATEWAY_UNAVAILABLE: 502,
  GATEWAY_INVALID_CREDENTIALS: 401,
  INTROSPECTION_FAILED: 502,
};

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await requireContentEditor();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;

  try {
    const result = await syncSchema(slug);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SyncSchemaError) {
      return NextResponse.json(
        { error: error.message },
        { status: STATUS_BY_ERROR_CODE[error.code] }
      );
    }
    throw error;
  }
}
