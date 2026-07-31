"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SyncSchemaResponse {
  slug: string;
  syncedAt: string;
  typeCount: number;
  queryFieldCount: number;
  mutationFieldCount: number;
}

interface SyncSchemaFormProps {
  slug: string;
  disabled?: boolean;
}

export function SyncSchemaForm({ slug, disabled = false }: SyncSchemaFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SyncSchemaResponse | null>(null);

  async function handleSync() {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/living-docs/projects/${slug}/sync`, {
        method: "POST",
      });
      const payload = (await response.json()) as SyncSchemaResponse & { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Falha ao sincronizar schema.");
        return;
      }

      setSuccess(payload);
      router.refresh();
    } catch {
      setError("Erro de rede ao sincronizar schema.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        disabled={disabled || submitting}
        onClick={handleSync}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sincronizando..." : "Sincronizar schema"}
      </button>

      {disabled ? (
        <p className="text-sm text-slate-600">
          Conecte o gateway primeiro para habilitar a sincronização de schema.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Schema sincronizado com sucesso: {success.typeCount} tipos, {success.queryFieldCount}{" "}
          campos de query, {success.mutationFieldCount} campos de mutation.
        </p>
      ) : null}
    </div>
  );
}
