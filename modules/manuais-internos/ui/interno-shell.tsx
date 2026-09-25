import type { ReactNode } from "react";

import { AppHeader, type AppNavItem } from "@/core/ui/app-shell";
import { PortalFooter } from "@/core/ui/portal-footer";
import { SessionActions } from "@/core/ui/session-actions";

interface InternoShellProps {
  children: ReactNode;
  navItems?: AppNavItem[];
}

export function InternoShell({ children, navItems = [] }: InternoShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader
        subtitle="Manuais internos — EDI"
        navItems={navItems}
        actions={<SessionActions />}
      />
      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-10">{children}</main>
      <PortalFooter />
    </div>
  );
}
