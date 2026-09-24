import type { ReactNode } from "react";

import { AppShell } from "@/core/ui/app-shell";
import { SessionActions } from "@/core/ui/session-actions";

interface FlowShellProps {
  children: ReactNode;
  subtitle?: string;
  documentationHref?: string;
}

export function FlowShell({ children, subtitle = "Fluxogramas", documentationHref = "/docs" }: FlowShellProps) {
  return (
    <AppShell
      subtitle={subtitle}
      navItems={[
        { href: "/fluxogramas", label: "Fluxogramas", active: true },
        { href: documentationHref, label: "Documentação" },
      ]}
      actions={<SessionActions />}
    >
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </AppShell>
  );
}
