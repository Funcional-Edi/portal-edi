import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import { validateMutationOrigin } from "@/core/security/request-origin";
import { ConnectApiError, connectApi } from "@/modules/living-docs-externa/services/connect-api";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    return null;
  }
  return session;
}

const STATUS_BY_ERROR_CODE: Record<ConnectApiError["code"], number> = {
  VALIDATION: 400,
  INVALID_URL: 400,
  PROJECT_NOT_FOUND: 404,
  WRONG_PROTOCOL: 400,
};

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const originError = validateMutationOrigin(request);
  if (originError) {
    return NextResponse.json({ error: originError }, { status: 403 });
  }

  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    const config = await connectApi(slug, body);
    return NextResponse.json({
      slug: config.slug,
      apiBaseUrl: config.apiBaseUrl,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    if (error instanceof ConnectApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: STATUS_BY_ERROR_CODE[error.code] }
      );
    }
    throw error;
  }
}
