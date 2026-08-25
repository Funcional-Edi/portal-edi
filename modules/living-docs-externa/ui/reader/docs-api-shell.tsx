import type { ReactNode } from "react";

import { AppShell } from "@/core/ui/app-shell";
import { SessionActions } from "@/core/ui/session-actions";

interface DocsApiShellProps {
  children: ReactNode;
  subtitle?: string;
  activeHref?: "/docs/api" | `/docs/api/${string}`;
}

export function DocsApiShell({
  children,
  subtitle = "Referência GraphQL",
  activeHref = "/docs/api",
}: DocsApiShellProps) {
  return (
    <AppShell
      subtitle={subtitle}
      navItems={[
        {
          href: "/docs/api",
          label: "Referência API",
          active: activeHref === "/docs/api",
        },
        { href: "/manual", label: "Manuais" },
      ]}
      actions={<SessionActions />}
    >
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </AppShell>
  );
}
