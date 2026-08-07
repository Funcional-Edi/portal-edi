import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import { getManualRef } from "@/modules/fluxogramas/repository/flow-repository";
import { saveIntegrationFlowInputSchema } from "@/modules/fluxogramas/schema";
import { exportFlowToMermaid, validateIntegrationFlow } from "@/modules/fluxogramas/services/flow-validation";
import { GetFlowError, getProjectFlow } from "@/modules/fluxogramas/services/get-flow";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/** Exporta Mermaid a partir do fluxo enviado (preview) ou validação antes de salvar. */
export async function POST(request: Request, { params }: RouteParams) {
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

  const parsed = saveIntegrationFlowInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const manual = await getManualRef(slug);
  const issues = validateIntegrationFlow(parsed.data, manual);
  if (issues.length > 0) {
    return NextResponse.json({ error: "Fluxo inválido.", details: issues }, { status: 422 });
  }

  return NextResponse.json({ mermaid: exportFlowToMermaid(parsed.data) });
}

/** Exporta Mermaid do fluxo já persistido. */
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const isAdmin = isAdminRole(session.user.role);

  try {
    const flow = await getProjectFlow(slug, { requirePublished: !isAdmin });
    return NextResponse.json({ mermaid: exportFlowToMermaid(flow) });
  } catch (error) {
    if (error instanceof GetFlowError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
