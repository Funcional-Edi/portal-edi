import { NextResponse } from "next/server";

import { auth } from "@/core/auth";
import { playgroundRequestInputSchema } from "@/modules/living-docs-externa/schema/playground";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";
import {
  PlaygroundAllowlistError,
  validatePlaygroundQuery,
} from "@/modules/living-docs-externa/services/playground-allowlist";
import {
  PlaygroundProxyError,
  runPlaygroundQuery,
} from "@/modules/living-docs-externa/services/proxy-playground";

/**
 * BFF do playground GraphQL (Fase 4.3). Único ponto de entrada client-side
 * para executar queries contra o gateway real de um projeto — o token
 * master do gateway nunca sai do servidor (ver `services/proxy-playground.ts`).
 *
 * Fluxo: sessão logada → projeto publicado → allowlist → proxy → JSON.
 */

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const ALLOWLIST_STATUS_BY_ERROR_CODE: Record<PlaygroundAllowlistError["code"], number> = {
  INVALID_QUERY: 400,
  MULTIPLE_OPERATIONS_NOT_SUPPORTED: 400,
  SUBSCRIPTION_NOT_ALLOWED: 403,
  INTROSPECTION_NOT_ALLOWED: 403,
  OPERATION_NOT_ALLOWLISTED: 403,
};

const PROXY_STATUS_BY_ERROR_CODE: Record<PlaygroundProxyError["code"], number> = {
  PROJECT_NOT_FOUND: 404,
  GATEWAY_NOT_CONNECTED: 409,
  INVALID_URL: 400,
  GATEWAY_UNAVAILABLE: 502,
  // Credenciais salvas passaram a ser recusadas pelo gateway: problema de
  // configuração do projeto, não do distribuidor que chamou o playground.
  GATEWAY_INVALID_CREDENTIALS: 502,
};

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = playgroundRequestInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const project = await getPublishedManual(slug);
  if (!project) {
    return NextResponse.json(
      { error: `Projeto "${slug}" não encontrado ou manual não publicado.` },
      { status: 404 }
    );
  }

  try {
    validatePlaygroundQuery(project.manual, parsed.data.query);
  } catch (error) {
    if (error instanceof PlaygroundAllowlistError) {
      return NextResponse.json(
        { error: error.message },
        { status: ALLOWLIST_STATUS_BY_ERROR_CODE[error.code] }
      );
    }
    throw error;
  }

  try {
    const result = await runPlaygroundQuery(slug, parsed.data.query, parsed.data.variables);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PlaygroundProxyError) {
      return NextResponse.json(
        { error: error.message },
        { status: PROXY_STATUS_BY_ERROR_CODE[error.code] }
      );
    }
    throw error;
  }
}
