import type { ReactNode } from "react";

import { AppHeader } from "@/core/ui/app-shell";
import { SessionActions } from "@/core/ui/session-actions";

interface AdminShellProps {
  children: ReactNode;
  activeNavHref?: string;
}

export function AdminShell({ children, activeNavHref = "/admin/projects" }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        subtitle="Admin — Documentação viva"
        navItems={[
          { href: "/admin/projects", label: "Projetos", active: activeNavHref === "/admin/projects" },
          { href: "/admin/metrics", label: "Métricas", active: activeNavHref === "/admin/metrics" },
          { href: "/docs", label: "Ver catálogo" },
        ]}
        actions={<SessionActions />}
      />
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
