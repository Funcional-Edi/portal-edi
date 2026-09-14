"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ConnectApiFormProps {
  slug: string;
  currentApiBaseUrl?: string;
}

export function ConnectApiForm({ slug, currentApiBaseUrl }: ConnectApiFormProps) {
  const router = useRouter();
  const [apiBaseUrl, setApiBaseUrl] = useState(currentApiBaseUrl ?? "");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/living-docs/projects/${slug}/connect-api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiBaseUrl, login, password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Não foi possível salvar a conexão da API.");
        return;
      }

      // Senha nunca fica em memória do client após o envio.
      setPassword("");
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Erro de rede ao salvar a conexão da API.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Este projeto usa protocolo <span className="font-medium">REST</span>. Diferente do
        gateway GraphQL, o portal não verifica automaticamente o login/senha contra a API —
        eles são gravados cifrados e a validação acontece na primeira chamada real.
      </p>

      <div>
        <label htmlFor="apiBaseUrl" className="block text-sm font-medium text-slate-700">
          URL base da API (REST)
        </label>
        <input
          id="apiBaseUrl"
          name="apiBaseUrl"
          type="url"
          required
          value={apiBaseUrl}
          onChange={(event) => setApiBaseUrl(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
          placeholder="https://api.exemplo.com.br"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="login" className="block text-sm font-medium text-slate-700">
            Login
          </label>
          <input
            id="login"
            name="login"
            required
            autoComplete="off"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-slate-500">
        A senha é gravada cifrada no servidor (AES-256-GCM) e nunca é reenviada ao navegador.
      </p>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Conexão salva com sucesso.
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {submitting ? "Salvando…" : "Salvar conexão"}
        </button>
      </div>
    </form>
  );
}
