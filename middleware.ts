import { NextResponse } from "next/server";

import { auth } from "@/core/auth";
import {
  canAccessPath,
  getForbiddenRedirectPath,
  isPublicPath,
  pathRequiresAuth,
} from "@/core/auth/module-access";
import { registerAllModules } from "@/modules/registry";

const modules = registerAllModules();

/**
 * RBAC genérico por módulo (basePath + access do registry).
 * - `/` e `/login` são públicos (login inline na home).
 * - `/api/*` exige sessão, exceto `/api/auth` e `/api/health` (defesa em profundidade).
 * - Rotas de módulo exigem sessão; client bloqueado em admin → /manual.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  if (pathname.startsWith("/api/") && !isPublicPath(pathname)) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (pathname === "/projects" || pathname.startsWith("/projects/")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^\/projects(?=\/|$)/, "/manual");
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (pathname === "/login") {
    const homeUrl = new URL("/", req.nextUrl);
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) homeUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(homeUrl);
  }

  if (!session && pathRequiresAuth(pathname, modules)) {
    const loginUrl = new URL("/", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && !canAccessPath(role, pathname, modules)) {
    return NextResponse.redirect(new URL(getForbiddenRedirectPath(role), req.nextUrl));
  }

  const curateMatch = pathname.match(/^\/admin\/projects\/([^/]+)\/curate(?:\/.*)?$/);
  if (curateMatch) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = `/admin/projects/${curateMatch[1]}/edit`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/login",
    "/admin/:path*",
    "/manual/:path*",
    "/docs/:path*",
    "/projects/:path*",
    "/fluxogramas/:path*",
    "/interno/:path*",
    "/homologacao/:path*",
    "/assistente/:path*",
    "/compliance/:path*",
    "/api/:path*",
  ],
};
