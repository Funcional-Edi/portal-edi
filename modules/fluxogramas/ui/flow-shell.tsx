import type { ReactNode } from "react";

import { AppShell } from "@/core/ui/app-shell";
import { SessionActions } from "@/core/ui/session-actions";

interface FlowShellProps {
  children: ReactNode;
  subtitle?: string;
}

export function FlowShell({ children, subtitle = "Fluxogramas" }: FlowShellProps) {
  return (
    <AppShell
      subtitle={subtitle}
      navItems={[
        { href: "/fluxogramas", label: "Fluxogramas", active: true },
        { href: "/manual", label: "Manuais" },
      ]}
      actions={<SessionActions />}
    >
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </AppShell>
  );
}
