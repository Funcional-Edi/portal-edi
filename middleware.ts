import { NextResponse } from "next/server";
import { auth } from "@/core/auth";

/**
 * RBAC de rotas (esqueleto). Regras:
 * - `/admin/**` exige papel admin.
 * - `/manual/**` exige login.
 * - rotas públicas (landing, /login, /api/auth, /api/health) passam.
 * Módulos futuros herdam este padrão via basePath do module-registry.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  if (pathname === "/projects" || pathname.startsWith("/projects/")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^\/projects(?=\/|$)/, "/manual");
    return NextResponse.redirect(redirectUrl, 308);
  }

  const isAdminArea = pathname.startsWith("/admin");
  const isManualArea = pathname.startsWith("/manual");

  if (!session && (isAdminArea || isManualArea)) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminArea && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Curadoria do portal legado virou o editor canônico (fase 6).
  const curateMatch = pathname.match(/^\/admin\/projects\/([^/]+)\/curate(?:\/.*)?$/);
  if (curateMatch) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = `/admin/projects/${curateMatch[1]}/edit`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/manual/:path*", "/projects/:path*"],
};
