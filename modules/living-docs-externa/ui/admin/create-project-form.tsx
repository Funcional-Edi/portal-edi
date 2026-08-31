"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PRODUCT_FAMILY_METADATA, PRODUCT_FAMILY_ORDER } from "@/modules/living-docs-externa/schema/family";
import type { ProductFamily } from "@/modules/living-docs-externa/schema/family";
import {
  normalizeSlugInput,
  type ProjectProtocol,
} from "@/modules/living-docs-externa/schema/project";

export function CreateProjectForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [family, setFamily] = useState<ProductFamily>(PRODUCT_FAMILY_ORDER[0]);
  const [protocol, setProtocol] = useState<ProjectProtocol>("graphql");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/living-docs/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name,
          description: description || undefined,
          family,
          protocol,
        }),
      });

      const payload = (await response.json()) as { error?: string; slug?: string };

      if (!response.ok) {
        setError(payload.error ?? "Não foi possível criar o projeto.");
        return;
      }

      router.push(`/admin/projects/${payload.slug ?? slug}`);
      router.refresh();
    } catch {
      setError("Erro de rede ao criar projeto.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5">
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          required
          pattern="[a-z0-9-]+"
          minLength={2}
          maxLength={64}
          value={slug}
          onChange={(event) => setSlug(normalizeSlugInput(event.target.value))}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
          placeholder="ex.: im, wholesaler"
        />
        <p className="mt-1 text-xs text-slate-500">Minúsculas, números e hífens.</p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={200}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="ex.: Inventário (IM)"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Descrição (opcional)
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={2000}
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="family" className="block text-sm font-medium text-slate-700">
          Família
        </label>
        <select
          id="family"
          name="family"
          required
          value={family}
          onChange={(event) => setFamily(event.target.value as ProductFamily)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {PRODUCT_FAMILY_ORDER.map((option) => (
            <option key={option} value={option}>
              {PRODUCT_FAMILY_METADATA[option].name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          Agrupamento no catálogo de manuais/referência GraphQL.
        </p>
      </div>

      <div>
        <label htmlFor="protocol" className="block text-sm font-medium text-slate-700">
          Protocolo
        </label>
        <select
          id="protocol"
          name="protocol"
          required
          value={protocol}
          onChange={(event) => setProtocol(event.target.value as ProjectProtocol)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="graphql">GraphQL</option>
          <option value="rest">REST</option>
        </select>
        <p className="mt-1 text-xs text-slate-500">
          Define se o manual documenta operações GraphQL (padrão) ou endpoints REST.
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
          {submitting ? "Criando…" : "Criar projeto"}
        </button>
      </div>
    </form>
  );
}
