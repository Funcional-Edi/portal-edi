import Link from "next/link";
import type { ReactNode } from "react";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/" className="text-xs font-medium text-slate-500 hover:text-brand-700">
              Portal de Integração
            </Link>
            <p className="text-sm font-semibold text-slate-900">Admin — Documentação viva</p>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/admin/projects" className="text-brand-700 hover:underline">
              Projetos
            </Link>
            <Link href="/manual" className="text-slate-600 hover:text-brand-700">
              Ver catálogo
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
