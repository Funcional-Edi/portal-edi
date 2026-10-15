import { NextResponse } from "next/server";

import { AccessListError, keepPeopleOnCurrentSso, loadAccessList, saveAccessList } from "@/core/auth/access-list";
import { appendAccessAuditEvent } from "@/core/auth/access-audit";
import { loadFirstAccessMap } from "@/core/auth/first-access";
import { requireAdmin } from "@/core/auth/require-role";
import { getClientIp } from "@/core/auth/rate-limit";
import { validateSsoCredentials } from "@/core/auth/sso";
import { loadStoredSsoConfig, probeSsoUrl, saveSsoUrl, validateSsoUrl } from "@/core/auth/sso-config";
import { GithubContentError } from "@/core/db/adapters";
import { validateMutationOrigin } from "@/core/security/request-origin";

function toPublic(config: { admins: string[]; editors: string[] }) {
  return { admins: config.admins, editors: config.editors };
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const config = await loadAccessList();
  const firstAccess = await loadFirstAccessMap();
  const ssoConfig = await loadStoredSsoConfig();
  return NextResponse.json({
    ...toPublic(config),
    firstAccess,
    ssoUrl: ssoConfig?.url ?? null,
  });
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
  const ssoUrl = (body as { ssoUrl?: unknown })?.ssoUrl;
  const adminPassword = (body as { adminPassword?: unknown })?.adminPassword;

  try {
    let savedSsoUrl: string | null = null;
    if (typeof ssoUrl === "string" && ssoUrl.trim()) {
      if (typeof adminPassword !== "string" || !adminPassword) {
        return NextResponse.json({ error: "Informe sua senha para trocar a URL do SSO." }, { status: 400 });
      }
      if (!session.user.email) {
        return NextResponse.json({ error: "Sessão sem e-mail." }, { status: 400 });
      }
      await validateSsoCredentials(session.user.email, adminPassword, getClientIp(request.headers));
      const urlError = validateSsoUrl(ssoUrl);
      if (urlError) return NextResponse.json({ error: urlError }, { status: 400 });
      await probeSsoUrl(ssoUrl.trim());
      await keepPeopleOnCurrentSso(ssoUrl.trim());
      const stored = await saveSsoUrl({ url: ssoUrl.trim(), updatedBy: session.user.email });
      await appendAccessAuditEvent({
        action: "sso_url_updated",
        actorEmail: session.user.email,
        detail: stored.url,
      });
      savedSsoUrl = stored.url;
    }

    const saved = Array.isArray(admins) || Array.isArray(editors)
      ? await saveAccessList({ admins, editors }, session.user.email ?? undefined)
      : await loadAccessList();

    const firstAccess = await loadFirstAccessMap();
    return NextResponse.json({
      ...toPublic(saved),
      firstAccess,
      ssoUrl: savedSsoUrl,
    });
  } catch (error) {
    if (error instanceof AccessListError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if ((error as { code?: string })?.code === "sso_invalid_credentials") {
      return NextResponse.json({ error: "Senha inválida para confirmar a troca de URL do SSO." }, { status: 401 });
    }
    if ((error as { code?: string })?.code === "sso_unavailable") {
      return NextResponse.json({ error: "SSO indisponível para confirmar a senha." }, { status: 503 });
    }
    if (error instanceof GithubContentError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Não foi possível salvar a lista." }, { status: 500 });
  }
}
