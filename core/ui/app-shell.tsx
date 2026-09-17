import Link from "next/link";
import { LayoutGrid, Menu } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Header e casca visual COMPARTILHADOS por toda a aplicação (home, manual,
 * admin, login). Antes desta fundação cada área reimplementava seu próprio
 * `<header>` do zero — três variações levemente diferentes do mesmo elemento,
 * a principal causa da inconsistência visual do portal (ver
 * `docs/migracao/decisoes-ui.md`).
 *
 * `AppHeader` é exportado separadamente porque telas com layout próprio
 * (ex.: `ManualShell`, que monta um grid de sidebar + conteúdo + TOC) só
 * precisam do cabeçalho, não do wrapper de página inteira.
 */
export interface AppNavItem {
  href: string;
  label: string;
  active?: boolean;
}

interface AppHeaderProps {
  /** Rótulo abaixo do nome do portal (ex.: "Documentação viva", "Admin"). */
  subtitle?: string;
  navItems?: AppNavItem[];
  /** Slot à direita — normalmente `<SessionActions />` (ver session-actions.tsx). */
  actions?: ReactNode;
}

export function AppHeader({ subtitle, navItems = [], actions }: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white">
            <LayoutGrid className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-slate-900">
              Portal de Integração
            </span>
            {subtitle ? (
              <span className="block text-xs text-slate-500">{subtitle}</span>
            ) : null}
          </span>
        </Link>

        <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2 sm:gap-4">
          {navItems.length > 0 ? (
            <details className="relative lg:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600">
                <Menu className="h-4 w-4" aria-hidden="true" />
                Menu
              </summary>
              <nav className="absolute right-0 top-10 z-20 min-w-44 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded px-2 py-1.5 text-sm ${
                      item.active
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 transition hover:bg-slate-50 hover:text-brand-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </details>
          ) : null}
          {navItems.length > 0 ? (
            <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    item.active
                      ? "text-brand-700"
                      : "text-slate-600 transition hover:text-brand-700"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
          {actions}
        </div>
      </div>
    </header>
  );
}

interface AppShellProps extends AppHeaderProps {
  children: ReactNode;
}

/** Para telas simples (ex.: home). Telas com grid próprio usam `AppHeader` direto. */
export function AppShell({ children, ...headerProps }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader {...headerProps} />
      {children}
    </div>
  );
}
