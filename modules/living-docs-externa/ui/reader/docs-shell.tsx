import type { ReactNode } from "react";

import type { AppNavItem } from "@/core/ui/app-shell";
import { AppShell } from "@/core/ui/app-shell";
import { SessionActions } from "@/core/ui/session-actions";
import { DOCS_NAV_ITEMS } from "@/modules/living-docs-externa/services/docs-routes";

interface DocsShellProps {
  children: ReactNode;
  subtitle?: string;
  activeHref?: string;
}

export function DocsShell({
  children,
  subtitle = "Documentação",
  activeHref = DOCS_NAV_ITEMS[0].href,
}: DocsShellProps) {
  const navItems: AppNavItem[] = DOCS_NAV_ITEMS.map((item) => ({
    ...item,
    active: item.href === activeHref,
  }));

  return (
    <AppShell subtitle={subtitle} navItems={navItems} actions={<SessionActions />}>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </AppShell>
  );
}
