import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import { GetFlowError, getProjectFlow } from "@/modules/fluxogramas/services/get-flow";
import { SaveFlowError, saveProjectFlow } from "@/modules/fluxogramas/services/save-flow";

const GET_STATUS: Record<GetFlowError["code"], number> = {
  PROJECT_NOT_FOUND: 404,
  FLOW_NOT_FOUND: 404,
  NOT_PUBLISHED: 404,
};

const PUT_STATUS: Record<SaveFlowError["code"], number> = {
  PROJECT_NOT_FOUND: 404,
  VALIDATION: 400,
  FLOW_INVALID: 422,
};

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/** Obtém fluxo salvo. Distribuidor só vê projetos publicados. */
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const isAdmin = isAdminRole(session.user.role);

  try {
    const flow = await getProjectFlow(slug, { requirePublished: !isAdmin });
    return NextResponse.json(flow);
  } catch (error) {
    if (error instanceof GetFlowError) {
      return NextResponse.json({ error: error.message }, { status: GET_STATUS[error.code] });
    }
    throw error;
  }
}

/** Persiste fluxo curado (somente admin). */
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
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
    const flow = await saveProjectFlow(slug, body);
    return NextResponse.json(flow);
  } catch (error) {
    if (error instanceof SaveFlowError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: PUT_STATUS[error.code] }
      );
    }
    throw error;
  }
}
