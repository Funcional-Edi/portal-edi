import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <header className="mb-8 text-center">
        <p className="text-sm font-medium text-brand-700">Portal de Integração</p>
        <h1 className="mt-1 text-2xl font-bold">Entrar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Acesso aos manuais de integração (SSO ou login dev local).
        </p>
      </header>
      <Suspense fallback={<p className="text-center text-sm text-slate-500">Carregando…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
