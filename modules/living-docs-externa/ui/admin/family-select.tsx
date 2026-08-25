"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  PRODUCT_FAMILY_METADATA,
  PRODUCT_FAMILY_ORDER,
  type ProductFamily,
} from "@/modules/living-docs-externa/schema/family";

interface FamilySelectProps {
  slug: string;
  family?: ProductFamily;
}

/** Reclassifica a família de um projeto existente (agrupamento no catálogo). */
export function FamilySelect({ slug, family }: FamilySelectProps) {
  const router = useRouter();
  const [value, setValue] = useState<ProductFamily | "">(family ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as ProductFamily;
    setValue(next);
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/living-docs/projects/${slug}/family`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family: next }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Não foi possível reclassificar a família.");
        return;
      }

      router.refresh();
    } catch {
      setError("Erro de rede ao reclassificar a família.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <select
        value={value}
        disabled={submitting}
        onChange={handleChange}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-60"
        aria-label="Família do produto"
      >
        {!value ? <option value="">Sem família</option> : null}
        {PRODUCT_FAMILY_ORDER.map((option) => (
          <option key={option} value={option}>
            {PRODUCT_FAMILY_METADATA[option].name}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-red-800">{error}</p> : null}
    </div>
  );
}
