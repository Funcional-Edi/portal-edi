import Link from "next/link";
import type { ReactNode } from "react";

import { AppHeader, type AppNavItem } from "@/core/ui/app-shell";
import { SessionActions } from "@/core/ui/session-actions";
import { DOCS_HOME_HREF } from "@/modules/living-docs-externa/services/docs-routes";

export interface ManualNavItem {
  href: string;
  label: string;
  active?: boolean;
}

export interface ManualNavGroup {
  title: string;
  items: ManualNavItem[];
}

export interface ManualTocItem {
  href: string;
  label: string;
}

interface ManualShellProps {
  children: ReactNode;
  sidebarGroups?: ManualNavGroup[];
  tocItems?: ManualTocItem[];
  /** Rótulo do cabeçalho. O admin troca para identificar o modo edição. */
  subtitle?: string;
  /** Links principais no header (ex.: Catálogo). */
  navItems?: AppNavItem[];
  /** Links à direita do cabeçalho. Padrão: catálogo do distribuidor. */
  headerActions?: ReactNode;
  productNavigation?: ReactNode;
}

export function ManualShell({
  children,
  sidebarGroups = [],
  tocItems = [],
  subtitle = "Documentação viva",
  navItems = [],
  headerActions,
  productNavigation,
}: ManualShellProps) {
  const hasSidebar = !productNavigation && sidebarGroups.some((group) => group.items.length > 0);
  const hasToc = tocItems.length > 0;
  const hasRailLayout = hasSidebar || hasToc;
  const railColumns = hasSidebar
    ? "lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_14rem]"
    : "xl:grid-cols-[minmax(0,1fr)_14rem]";
  const showDefaultCatalogLink = headerActions == null && navItems.length === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        subtitle={subtitle}
        navItems={navItems}
        actions={
          <div className="flex items-center gap-4">
            {headerActions}
            {showDefaultCatalogLink ? (
              <Link
                href={DOCS_HOME_HREF}
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                Documentação
              </Link>
            ) : null}
            <SessionActions />
          </div>
        }
      />
      <main className={productNavigation ? "mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:py-10" : "mx-auto max-w-7xl px-6 py-10"}>
        {productNavigation ?? (hasRailLayout ? (
          <div className={`grid gap-8 ${railColumns}`}>
            {hasSidebar ? (
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-5">
                  {sidebarGroups.map((group) => (
                    <section
                      key={group.title}
                      className="hidden rounded-lg border border-slate-200 bg-white p-4 lg:block"
                    >
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {group.title}
                      </p>
                      <ul className="space-y-1.5">
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              aria-current={item.active ? "page" : undefined}
                              className={`block rounded-md px-2 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                                item.active
                                  ? "bg-brand-50 font-medium text-brand-800"
                                  : "text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </aside>
            ) : null}

            <div className="min-w-0">
              {hasToc ? (
                <nav
                  aria-label="Navegação rápida"
                  className="mb-6 flex gap-2 overflow-x-auto pb-1 xl:hidden"
                >
                  {tocItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-600 hover:text-brand-700"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              ) : null}
              {children}
            </div>

            {hasToc ? (
              <aside className="hidden xl:block">
                <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Índice
                  </p>
                  <ul className="space-y-1.5">
                    {tocItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            ) : null}
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">{children}</div>
        ))}
      </main>
    </div>
  );
}
