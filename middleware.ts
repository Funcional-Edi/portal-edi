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

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/manual/:path*"],
};
