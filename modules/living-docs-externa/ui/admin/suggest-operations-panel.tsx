"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  SuggestedOperation,
  SuggestOperationsResult,
} from "@/modules/living-docs-externa/services/suggest-operations-from-schema";

interface SuggestOperationsPanelProps {
  slug: string;
  result: SuggestOperationsResult;
}

function suggestionKey(suggestion: SuggestedOperation): string {
  return `${suggestion.kind}:${suggestion.name}`;
}

/**
 * Triagem das operações descobertas no schema sincronizado (fluxo determinístico,
 * sem IA — ver `services/suggest-operations-from-schema.ts`). O operador marca o
 * que entra no manual; nada é adicionado sem confirmação explícita.
 */
export function SuggestOperationsPanel({ slug, result }: SuggestOperationsPanelProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pending = useMemo(
    () => result.suggestions.filter((suggestion) => !suggestion.alreadyAdded),
    [result.suggestions]
  );

  if (!result.hasSchema) {
    return (
      <p className="text-sm text-slate-600">
        Sincronize o schema acima para o portal descobrir as queries e mutations
        disponíveis e sugerir operações para o manual.
      </p>
    );
  }

  if (pending.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        Todas as {result.suggestions.length} operações descobertas no schema já estão
        no manual.
      </p>
    );
  }

  function toggle(key: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleAddSelected() {
    setError(null);
    setSuccessCount(null);
    setSubmitting(true);

    try {
      const chosen = pending.filter((suggestion) => selected.has(suggestionKey(suggestion)));
      const response = await fetch(`/api/living-docs/projects/${slug}/operations/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operations: chosen.map((suggestion) => suggestion.draft) }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        added?: unknown[];
      };

      if (!response.ok) {
        setError(payload.error ?? "Não foi possível adicionar as operações selecionadas.");
        return;
      }

      setSuccessCount(payload.added?.length ?? chosen.length);
      setSelected(new Set());
      router.refresh();
    } catch {
      setError("Erro de rede ao adicionar as operações selecionadas.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        {pending.length} {pending.length === 1 ? "operação encontrada" : "operações encontradas"}{" "}
        no schema e ainda fora do manual. Marque as que fazem parte deste produto — o
        rascunho (título, exemplo) pode ser ajustado depois em cada operação.
      </p>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Tipo</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Campo</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Descrição no schema</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Exemplo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pending.map((suggestion) => {
              const key = suggestionKey(suggestion);
              const isChecked = selected.has(key);
              const isExpanded = expandedKey === key;

              return (
                <Fragment key={key}>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(key)}
                        className="rounded border-slate-300"
                        aria-label={`Selecionar ${key}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase text-slate-700">
                        {suggestion.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-slate-800">{suggestion.name}</p>
                      <p className="text-slate-600">{suggestion.draft.title}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {suggestion.schemaDescription ?? (
                        <span className="italic text-slate-400">sem descrição no schema</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setExpandedKey(isExpanded ? null : key)}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {isExpanded ? "Fechar" : "Ver exemplo"}
                      </button>
                    </td>
                  </tr>
                  {isExpanded ? (
                    <tr>
                      <td colSpan={5} className="bg-slate-50 px-4 py-4">
                        <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                          {suggestion.draft.exampleQuery ?? "(sem exemplo)"}
                        </pre>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {successCount != null ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {successCount} {successCount === 1 ? "operação adicionada" : "operações adicionadas"} ao
          manual. Continue a curadoria em &quot;Operações do manual&quot;, abaixo.
        </p>
      ) : null}

      <button
        type="button"
        disabled={selected.size === 0 || submitting}
        onClick={handleAddSelected}
        className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Adicionando…"
          : `Adicionar ${selected.size || ""} selecionada${selected.size === 1 ? "" : "s"}`.trim()}
      </button>
    </div>
  );
}
