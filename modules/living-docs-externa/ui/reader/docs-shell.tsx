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
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:py-10">
        <ProductNavigation navigation={navigation}>{children}</ProductNavigation>
      </div>
    </AppShell>
  );
}
