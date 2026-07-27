import Link from "next/link";
import type { ReactNode } from "react";

interface ManualShellProps {
  children: ReactNode;
}

export function ManualShell({ children }: ManualShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/" className="text-xs font-medium text-slate-500 hover:text-brand-700">
              Portal de Integração
            </Link>
            <p className="text-sm font-semibold text-slate-900">Documentação viva</p>
          </div>
          <Link
            href="/manual"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            Catálogo
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
