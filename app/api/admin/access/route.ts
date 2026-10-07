import { NextResponse } from "next/server";

import { AccessListError, loadAccessList, saveAccessList } from "@/core/auth/access-list";
import { requireAdmin } from "@/core/auth/require-role";
import { GithubContentError } from "@/core/db/adapters";
import { validateMutationOrigin } from "@/core/security/request-origin";

function toPublic(config: { admins: string[]; editors: string[] }) {
  return { admins: config.admins, editors: config.editors };
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const config = await loadAccessList();
  return NextResponse.json(toPublic(config));
}

export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const originError = validateMutationOrigin(request);
  if (originError) return NextResponse.json({ error: originError }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const admins = (body as { admins?: unknown })?.admins;
  const editors = (body as { editors?: unknown })?.editors;
  try {
    const saved = await saveAccessList({ admins, editors });
    return NextResponse.json(toPublic(saved));
  } catch (error) {
    if (error instanceof AccessListError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof GithubContentError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Não foi possível salvar a lista." }, { status: 500 });
  }
}
