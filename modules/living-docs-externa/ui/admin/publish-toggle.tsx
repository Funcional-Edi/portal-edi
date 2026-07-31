"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface PublishToggleProps {
  slug: string;
  published: boolean;
}

export function PublishToggle({ slug, published }: PublishToggleProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/living-docs/projects/${slug}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Não foi possível atualizar a publicação.");
        return;
      }

      router.refresh();
    } catch {
      setError("Erro de rede ao atualizar a publicação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            published ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-700"
          }`}
        >
          {published ? "Publicado" : "Rascunho"}
        </span>
        <button
          type="button"
          disabled={submitting}
          onClick={handleToggle}
          className={
            published
              ? "rounded-md border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
              : "rounded-md bg-brand-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
          }
        >
          {submitting ? "Atualizando…" : published ? "Despublicar" : "Publicar"}
        </button>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
