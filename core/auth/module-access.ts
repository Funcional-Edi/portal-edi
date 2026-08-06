/**
 * RBAC por módulo — deriva permissões do module-registry (basePath + access).
 * core/ não importa modules/; quem chama registra os módulos antes (middleware, app).
 */

import type { UserRole } from "@/core/auth/roles";
import type { ModuleAccess, PortalModule } from "@/core/module-registry";

const PUBLIC_PATHS = new Set(["/", "/login"]);
const PUBLIC_PREFIXES = ["/api/auth", "/api/health"] as const;
export const ADMIN_PATH_PREFIX = "/admin";

export function canAccessLevel(role: UserRole, access: ModuleAccess): boolean {
  switch (access) {
    case "any":
      return true;
    case "admin":
      return role === "admin";
    case "client":
      return role === "client" || role === "admin";
    default:
      return false;
  }
}

export function canAccessModule(role: UserRole, portalModule: PortalModule): boolean {
  return canAccessLevel(role, portalModule.access);
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Maior basePath que casa com pathname (ex.: /manual/im → módulo /manual). */
export function findModuleForPath(
  pathname: string,
  modules: PortalModule[]
): PortalModule | undefined {
  const matches = modules.filter(
    (portalModule) =>
      pathname === portalModule.basePath || pathname.startsWith(`${portalModule.basePath}/`)
  );
  if (matches.length === 0) return undefined;
  return matches.sort((a, b) => b.basePath.length - a.basePath.length)[0];
}

export function pathRequiresAuth(pathname: string, modules: PortalModule[]): boolean {
  if (isPublicPath(pathname)) return false;
  if (pathname.startsWith(ADMIN_PATH_PREFIX)) return true;
  return findModuleForPath(pathname, modules) !== undefined;
}

export function canAccessPath(
  role: UserRole | undefined,
  pathname: string,
  modules: PortalModule[]
): boolean {
  if (isPublicPath(pathname)) return true;

  if (pathname.startsWith(ADMIN_PATH_PREFIX)) {
    return role === "admin";
  }

  const portalModule = findModuleForPath(pathname, modules);
  if (!portalModule) return true;

  if (!role) return false;
  return canAccessModule(role, portalModule);
}

/** Evita open redirect: só paths relativos internos. */
export function isSafeCallbackUrl(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//") && !url.includes("\\");
}

/** Destino pós-login: callbackUrl seguro permitido para o papel, senão padrão por role. */
export function resolvePostLoginPath(
  role: UserRole,
  callbackUrl: string | null | undefined,
  modules: PortalModule[]
): string {
  if (
    callbackUrl &&
    isSafeCallbackUrl(callbackUrl) &&
    canAccessPath(role, callbackUrl, modules)
  ) {
    return callbackUrl;
  }
  return role === "admin" ? "/" : "/manual";
}

/** Onde mandar quem não tem permissão na rota pedida. */
export function getForbiddenRedirectPath(role: UserRole | undefined): string {
  return role === "admin" ? "/" : "/manual";
}
