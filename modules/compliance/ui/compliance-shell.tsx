import type { ReactNode } from "react";

import { AppHeader, type AppNavItem } from "@/core/ui/app-shell";
import { PortalFooter } from "@/core/ui/portal-footer";
import { SessionActions } from "@/core/ui/session-actions";

interface ComplianceShellProps {
  children: ReactNode;
  navItems?: AppNavItem[];
}

export function ComplianceShell({ children, navItems = [] }: ComplianceShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader
        subtitle="Compliance — proteção de dados"
        navItems={navItems}
        actions={<SessionActions />}
      />
      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
      <PortalFooter />
    </div>
  );
}
