"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ConnectGatewayFormProps {
  slug: string;
  currentGraphqlUrl?: string;
}

export function ConnectGatewayForm({ slug, currentGraphqlUrl }: ConnectGatewayFormProps) {
  const router = useRouter();
  const [graphqlUrl, setGraphqlUrl] = useState(currentGraphqlUrl ?? "");
  const [gatewaySlug, setGatewaySlug] = useState("");
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
      const response = await fetch(`/api/living-docs/projects/${slug}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graphqlUrl,
          login,
          password,
          gatewaySlug: gatewaySlug || undefined,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Não foi possível conectar ao gateway.");
        return;
      }

      // Senha nunca fica em memória do client após o envio.
      setPassword("");
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Erro de rede ao conectar ao gateway.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="graphqlUrl" className="block text-sm font-medium text-slate-700">
          URL do gateway (GraphQL)
        </label>
        <input
          id="graphqlUrl"
          name="graphqlUrl"
          type="url"
          required
          value={graphqlUrl}
          onChange={(event) => setGraphqlUrl(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
          placeholder="https://gateway.exemplo.com.br/graphql"
        />
      </div>

      <div>
        <label htmlFor="gatewaySlug" className="block text-sm font-medium text-slate-700">
          Identificador do gateway (opcional)
        </label>
        <input
          id="gatewaySlug"
          name="gatewaySlug"
          value={gatewaySlug}
          onChange={(event) => setGatewaySlug(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
          placeholder={`padrão: ${slug}`}
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
        A senha é usada apenas para validar a conexão e é gravada cifrada no servidor
        (AES-256-GCM). Ela nunca é reenviada ao navegador.
      </p>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Gateway conectado com sucesso.
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {submitting ? "Conectando…" : "Conectar gateway"}
        </button>
      </div>
    </form>
  );
}
