import type { ReactNode } from "react";

import { AppHeader, type AppNavItem } from "@/core/ui/app-shell";
import { SessionActions } from "@/core/ui/session-actions";

interface ComplianceShellProps {
  children: ReactNode;
  navItems?: AppNavItem[];
}

export function ComplianceShell({ children, navItems = [] }: ComplianceShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        subtitle="Compliance — proteção de dados"
        navItems={navItems}
        actions={<SessionActions />}
      />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
