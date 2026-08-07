"use client";

import { useState } from "react";

interface NewSectionFormProps {
  slug: string;
  onDone: () => void;
  onCancel: () => void;
}

/** Sugere `titulo-da-secao` a partir do título, já no formato do nome do arquivo. */
function slugifyTitle(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function NewSectionForm({ slug, onDone, onCancel }: NewSectionFormProps) {
  const [title, setTitle] = useState("");
  const [id, setId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const effectiveId = idTouched ? id : slugifyTitle(title);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/living-docs/projects/${slug}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: effectiveId, title: title.trim() || undefined }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Não foi possível criar a seção.");
        return;
      }

      onDone();
    } catch {
      setError("Erro de rede ao criar a seção.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="section-title" className="block text-sm font-medium text-slate-700">
          Título da seção
        </label>
        <input
          id="section-title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="ex.: Janela de processamento"
        />
        <p className="mt-1 text-xs text-slate-500">
          Vira o `# título` no topo do Markdown.
        </p>
      </div>

      <div>
        <label htmlFor="section-id" className="block text-sm font-medium text-slate-700">
          Id (nome do arquivo)
        </label>
        <input
          id="section-id"
          required
          pattern="[a-z0-9-]+"
          minLength={2}
          maxLength={64}
          value={effectiveId}
          onChange={(event) => {
            setIdTouched(true);
            setId(event.target.value);
          }}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
          placeholder="ex.: janela-processamento"
        />
        <p className="mt-1 text-xs text-slate-500">
          Salvo em <code>content/projects/{slug}/sections/{effectiveId || "id"}.md</code>. Não
          pode ser alterado depois.
        </p>
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
          {submitting ? "Criando…" : "Criar seção"}
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
