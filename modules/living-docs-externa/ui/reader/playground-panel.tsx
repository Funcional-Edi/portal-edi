"use client";

import { useState } from "react";

/**
 * Painel do playground GraphQL (Fase 4.4, MVP). Duas textareas simples
 * (sem Monaco — fica para a Fase 4+/6) que chamam o BFF
 * `POST /api/living-docs/projects/[slug]/graphql`. O botão "Executar" é a
 * única ação; a query só roda de fato se a allowlist do servidor aceitar.
 */

interface PlaygroundPanelProps {
  slug: string;
  initialQuery?: string;
}

interface PlaygroundResponse {
  data?: unknown;
  errors?: Array<{ message?: string }>;
}

export function PlaygroundPanel({ slug, initialQuery = "" }: PlaygroundPanelProps) {
  const [query, setQuery] = useState(initialQuery);
  const [variablesText, setVariablesText] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlaygroundResponse | null>(null);

  async function handleRun() {
    setRunning(true);
    setError(null);
    setResult(null);

    let variables: Record<string, unknown> | undefined;
    if (variablesText.trim()) {
      try {
        variables = JSON.parse(variablesText) as Record<string, unknown>;
      } catch {
        setError("Variáveis inválidas: informe um JSON válido (ex.: {\"id\": 1}).");
        setRunning(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/living-docs/projects/${slug}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
      const payload = (await response.json()) as PlaygroundResponse & { error?: string };

      if (!response.ok) {
        setError(payload.error ?? `Falha ao executar (HTTP ${response.status}).`);
        return;
      }

      setResult(payload);
    } catch {
      setError("Erro de rede ao executar a query.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="playground-query"
          className="mb-1 block text-xs font-semibold uppercase text-slate-500"
        >
          Query / Mutation
        </label>
        <textarea
          id="playground-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          rows={12}
          spellCheck={false}
          placeholder={"query {\n  ...\n}"}
          className="w-full rounded-lg border border-slate-300 bg-slate-900 p-4 font-mono text-sm text-slate-100 focus:border-brand-600 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="playground-variables"
          className="mb-1 block text-xs font-semibold uppercase text-slate-500"
        >
          Variáveis (JSON, opcional)
        </label>
        <textarea
          id="playground-variables"
          value={variablesText}
          onChange={(event) => setVariablesText(event.target.value)}
          rows={4}
          spellCheck={false}
          placeholder="{}"
          className="w-full rounded-lg border border-slate-300 p-3 font-mono text-sm text-slate-700 focus:border-brand-600 focus:outline-none"
        />
      </div>

      <button
        type="button"
        disabled={running || !query.trim()}
        onClick={handleRun}
        className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {running ? "Executando..." : "Executar"}
      </button>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {result ? (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Resposta</p>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
            <code>{JSON.stringify(result, null, 2)}</code>
          </pre>
        </div>
      ) : null}
    </div>
  );
}
