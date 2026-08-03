import Link from "next/link";
import type { ReactNode } from "react";

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
  /** Links à direita do cabeçalho. Padrão: catálogo do distribuidor. */
  headerActions?: ReactNode;
}

export function ManualShell({
  children,
  sidebarGroups = [],
  tocItems = [],
  subtitle = "Documentação viva",
  headerActions,
}: ManualShellProps) {
  const hasSidebar = sidebarGroups.some((group) => group.items.length > 0);
  const hasToc = tocItems.length > 0;
  const hasRailLayout = hasSidebar || hasToc;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/" className="text-xs font-medium text-slate-500 hover:text-brand-700">
              Portal de Integração
            </Link>
            <p className="text-sm font-semibold text-slate-900">{subtitle}</p>
          </div>
          {headerActions ?? (
            <Link
              href="/manual"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              Catálogo
            </Link>
          )}
        </div>
      </header>
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
