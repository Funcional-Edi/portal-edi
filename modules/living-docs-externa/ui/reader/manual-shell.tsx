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
}

export function ManualShell({
  children,
  sidebarGroups = [],
  tocItems = [],
  subtitle = "Documentação viva",
  navItems = [],
  headerActions,
}: ManualShellProps) {
  const hasSidebar = sidebarGroups.some((group) => group.items.length > 0);
  const hasToc = tocItems.length > 0;
  const hasRailLayout = hasSidebar || hasToc;
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
      <main className="mx-auto max-w-7xl px-6 py-10">
        {hasRailLayout ? (
          <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_14rem]">
            {hasSidebar ? (
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-5">
                  {sidebarGroups.map((group) => (
                    <section
                      key={group.title}
                      className="rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {group.title}
                      </p>
                      <ul className="space-y-1.5">
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`block rounded-md px-2 py-1.5 text-sm transition ${
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

            <div className="min-w-0">{children}</div>

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
        )}
      </main>
    </div>
  );
}
