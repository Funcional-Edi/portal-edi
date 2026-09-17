import type { ReactNode } from "react";

import type { AppNavItem } from "@/core/ui/app-shell";
import { AppShell } from "@/core/ui/app-shell";
import { SessionActions } from "@/core/ui/session-actions";
import { DOCS_NAV_ITEMS } from "@/modules/living-docs-externa/services/docs-routes";
import { getDocumentationNavigation } from "@/modules/living-docs-externa/services/get-documentation-navigation";
import { ProductNavigation } from "@/modules/living-docs-externa/ui/reader/product-navigation";

interface DocsShellProps {
  children: ReactNode;
  subtitle?: string;
  activeHref?: string;
}

export async function DocsShell({
  children,
  subtitle = "Documentação",
  activeHref = DOCS_NAV_ITEMS[0].href,
}: DocsShellProps) {
  const navigation = await getDocumentationNavigation();
  const navItems: AppNavItem[] = DOCS_NAV_ITEMS.map((item) => ({
    ...item,
    active: item.href === activeHref,
  }));

  return (
    <AppShell subtitle={subtitle} navItems={navItems} actions={<SessionActions />}>
      <div className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:py-10">
        <aside className="min-w-0">
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <ProductNavigation navigation={navigation} />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </AppShell>
  );
}
