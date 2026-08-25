import type { ManualSection, Project } from "@/modules/living-docs-externa/schema";
import type { ReactNode } from "react";

import { buildManualNav } from "@/modules/living-docs-externa/ui/reader/build-manual-nav";
import { ManualShell } from "@/modules/living-docs-externa/ui/reader/manual-shell";

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
  const nav = await buildManualNav(slug, { kind, name, playground, project, sections });

  if (!nav) {
    return <ManualShell>{children}</ManualShell>;
  }

  return (
    <ManualShell
      sidebarGroups={nav.sidebarGroups}
      tocItems={nav.tocItems}
      navItems={[
        { href: "/manual", label: "Manuais", active: true },
        { href: "/docs/api", label: "Referência API" },
      ]}
    >
      {children}
    </ManualShell>
  );
}
