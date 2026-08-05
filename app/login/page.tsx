import { LayoutGrid } from "lucide-react";
import { Suspense } from "react";

import { env } from "@/core/config/env";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <header className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-700 text-white">
          <LayoutGrid className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-brand-700">Portal de Integração</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Acesso aos manuais de integração (SSO ou login dev local).
        </p>
      </header>
      <Suspense fallback={<p className="text-center text-sm text-slate-500">Carregando…</p>}>
        <LoginForm ssoConfigured={env.isSsoConfigured} devAuthEnabled={env.isDevAuthEnabled} />
      </Suspense>
    </main>
  );
}
