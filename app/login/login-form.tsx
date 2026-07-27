"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/manual";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDevLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("dev", { email, redirect: false, callbackUrl });
    setLoading(false);
    if (result?.error) {
      setError("Login dev falhou. Verifique DEV_AUTH_ENABLED=true no .env.local.");
      return;
    }
    window.location.href = result?.url ?? callbackUrl;
  }

  async function handleSsoLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("sso", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (result?.error) {
      setError("Credenciais inválidas ou SSO indisponível.");
      return;
    }
    window.location.href = result?.url ?? callbackUrl;
  }

  return (
    <form
      onSubmit={password ? handleSsoLogin : handleDevLogin}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <label className="block text-sm">
        <span className="font-medium text-slate-700">E-mail</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Senha (SSO)</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Opcional — login dev sem senha"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-900 disabled:opacity-50"
      >
        {loading ? "Entrando…" : password ? "Entrar com SSO" : "Entrar (dev)"}
      </button>
    </form>
  );
}
