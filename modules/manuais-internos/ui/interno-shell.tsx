import type { ReactNode } from "react";

import { AppHeader, type AppNavItem } from "@/core/ui/app-shell";
import { SessionActions } from "@/core/ui/session-actions";

interface InternoShellProps {
  children: ReactNode;
  navItems?: AppNavItem[];
}

export function InternoShell({ children, navItems = [] }: InternoShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        subtitle="Manuais internos — EDI"
        navItems={navItems}
        actions={<SessionActions />}
      />
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
