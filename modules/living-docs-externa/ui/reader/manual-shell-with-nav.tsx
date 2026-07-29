import type { ReactNode } from "react";

import { buildManualNav } from "@/modules/living-docs-externa/ui/reader/build-manual-nav";
import { ManualShell } from "@/modules/living-docs-externa/ui/reader/manual-shell";

interface ManualShellWithNavProps {
  slug: string;
  kind?: string;
  name?: string;
  children: ReactNode;
}

export async function ManualShellWithNav({
  slug,
  kind,
  name,
  children,
}: ManualShellWithNavProps) {
  const nav = await buildManualNav(slug, { kind, name });

  if (!nav) {
    return <ManualShell>{children}</ManualShell>;
  }

  return (
    <ManualShell sidebarGroups={nav.sidebarGroups} tocItems={nav.tocItems}>
      {children}
    </ManualShell>
  );
}
