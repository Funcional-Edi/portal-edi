"use client";

import { LogIn, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { getPostLoginPath } from "./actions";

type LoginMethod = "sso" | "dev";

interface LoginFormProps {
  ssoConfigured: boolean;
  devAuthEnabled: boolean;
}

/**
 * Formulário de login compartilhado (home `/` e redirect legado `/login`).
 * Método explícito: aba SSO vs dev local quando ambos configurados.
 */
export function LoginForm({ ssoConfigured, devAuthEnabled }: LoginFormProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const showTabs = ssoConfigured && devAuthEnabled;

  const [method, setMethod] = useState<LoginMethod>(ssoConfigured ? "sso" : "dev");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!ssoConfigured && !devAuthEnabled) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
        Nenhum método de login configurado. Defina{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
          FUNCIONAL_SSO_GRAPHQL_URL
        </code>{" "}
        ou{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">DEV_AUTH_ENABLED=true</code>{" "}
        no <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">.env.local</code>.
      </p>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const signInCallback = callbackUrl ?? "/";

    const result =
      method === "sso"
        ? await signIn("sso", {
            email,
            password,
            redirect: false,
            callbackUrl: signInCallback,
          })
        : await signIn("dev", { email, redirect: false, callbackUrl: signInCallback });

    if (result?.error) {
      setLoading(false);
      setError(
        method === "sso"
          ? "Credenciais inválidas ou SSO indisponível."
          : "Login dev falhou. Verifique DEV_AUTH_ENABLED=true no .env.local."
      );
      return;
    }

    const target = await getPostLoginPath(callbackUrl);
    window.location.href = target;
  }

  return (
    <div className="space-y-4">
      {showTabs ? (
        <div role="tablist" className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={method === "sso"}
            onClick={() => setMethod("sso")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              method === "sso" ? "bg-white text-brand-700 shadow-sm" : "text-slate-600"
            }`}
          >
            SSO
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={method === "dev"}
            onClick={() => setMethod("dev")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              method === "dev" ? "bg-white text-brand-700 shadow-sm" : "text-slate-600"
            }`}
          >
            Login local (dev)
          </button>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block text-sm">
          <span className="font-medium text-slate-700">E-mail</span>
          <div className="relative mt-1">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>
        </label>

        {method === "sso" ? (
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Senha</span>
            <div className="relative mt-1">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>
          </label>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900 disabled:opacity-50"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {loading ? "Entrando…" : method === "sso" ? "Entrar com SSO" : "Entrar (dev)"}
        </button>
      </form>
    </div>
  );
}
