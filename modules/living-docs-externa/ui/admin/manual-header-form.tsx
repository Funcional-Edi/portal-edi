"use client";

import { useState } from "react";

import type { IntegrationManual } from "@/modules/living-docs-externa/schema";

interface ManualHeaderFormProps {
  slug: string;
  manual: IntegrationManual;
  onDone: () => void;
  onCancel: () => void;
}

/** Cabeçalho do manual: o que o distribuidor lê no topo do roteiro. */
export function ManualHeaderForm({ slug, manual, onDone, onCancel }: ManualHeaderFormProps) {
  const [title, setTitle] = useState(manual.title);
  const [productName, setProductName] = useState(manual.productName ?? "");
  const [manualVersion, setManualVersion] = useState(manual.manualVersion ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/living-docs/projects/${slug}/manual`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          productName: productName.trim() || undefined,
          manualVersion: manualVersion.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Não foi possível salvar o cabeçalho.");
        return;
      }

      onDone();
    } catch {
      setError("Erro de rede ao salvar o cabeçalho.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="manual-title" className="block text-sm font-medium text-slate-700">
          Título do manual
        </label>
        <input
          id="manual-title"
          required
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="ex.: Integração IM - Inventário"
        />
      </div>

      <div>
        <label htmlFor="manual-product" className="block text-sm font-medium text-slate-700">
          Produto (opcional)
        </label>
        <input
          id="manual-product"
          maxLength={200}
          value={productName}
          onChange={(event) => setProductName(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="ex.: Inventory Management"
        />
      </div>

      <div>
        <label htmlFor="manual-version" className="block text-sm font-medium text-slate-700">
          Versão do manual (opcional)
        </label>
        <input
          id="manual-version"
          maxLength={32}
          value={manualVersion}
          onChange={(event) => setManualVersion(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="ex.: 1.3.0"
        />
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {submitting ? "Salvando…" : "Salvar cabeçalho"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
