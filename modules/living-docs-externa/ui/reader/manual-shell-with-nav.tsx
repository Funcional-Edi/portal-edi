import type { ManualSection, Project } from "@/modules/living-docs-externa/schema";
import type { ReactNode } from "react";

import { buildManualNav } from "@/modules/living-docs-externa/ui/reader/build-manual-nav";
import { ManualShell } from "@/modules/living-docs-externa/ui/reader/manual-shell";
import { DOCS_NAV_ITEMS } from "@/modules/living-docs-externa/services/docs-routes";
import { getDocumentationNavigation } from "@/modules/living-docs-externa/services/get-documentation-navigation";
import { ProductNavigation } from "@/modules/living-docs-externa/ui/reader/product-navigation";

interface ManualShellWithNavProps {
  slug: string;
  kind?: string;
  name?: string;
  playground?: boolean;
  /** Dados já carregados pela page — evita I/O duplicado no shell. */
  project?: Project;
  sections?: ManualSection[];
  children: ReactNode;
}

export async function ManualShellWithNav({
  slug,
  kind,
  name,
  playground,
  project,
  sections,
  children,
}: ManualShellWithNavProps) {
  const [nav, navigation] = await Promise.all([
    buildManualNav(slug, { kind, name, playground, project, sections }),
    getDocumentationNavigation(),
  ]);

  if (!nav) {
    return <ManualShell>{children}</ManualShell>;
  }

  return (
    <ManualShell
      productNavigation={<ProductNavigation navigation={navigation} />}
      sidebarGroups={nav.sidebarGroups}
      tocItems={nav.tocItems}
      navItems={DOCS_NAV_ITEMS.map((item) => ({
        ...item,
        active: item.href === DOCS_NAV_ITEMS[0].href,
      }))}
    >
      {children}
    </ManualShell>
  );
}
