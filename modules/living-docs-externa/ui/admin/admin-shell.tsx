import type { ReactNode } from "react";

import { AppHeader } from "@/core/ui/app-shell";
import { SessionActions } from "@/core/ui/session-actions";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        subtitle="Admin — Documentação viva"
        navItems={[
          { href: "/admin/projects", label: "Projetos", active: true },
          { href: "/manual", label: "Ver catálogo" },
        ]}
        actions={<SessionActions />}
      />
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
