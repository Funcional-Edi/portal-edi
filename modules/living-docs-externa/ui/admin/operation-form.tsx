"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ManualOperation, ManualOperationKind } from "@/modules/living-docs-externa/schema";

interface OperationFormProps {
  slug: string;
  mode: "create" | "edit";
  operation?: ManualOperation;
  onDone: () => void;
  onCancel: () => void;
}

function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function csvToList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function OperationForm({ slug, mode, operation, onDone, onCancel }: OperationFormProps) {
  const router = useRouter();
  const [kind, setKind] = useState<ManualOperationKind>(operation?.kind ?? "query");
  const [name, setName] = useState(operation?.name ?? "");
  const [order, setOrder] = useState(operation?.order != null ? String(operation.order) : "");
  const [title, setTitle] = useState(operation?.title ?? "");
  const [description, setDescription] = useState(operation?.description ?? "");
  const [exampleQuery, setExampleQuery] = useState(operation?.exampleQuery ?? "");
  const [authRequired, setAuthRequired] = useState(operation?.authRequired ?? false);
  const [prerequisites, setPrerequisites] = useState((operation?.prerequisites ?? []).join("\n"));
  const [businessNotes, setBusinessNotes] = useState((operation?.businessNotes ?? []).join("\n"));
  const [relatedSections, setRelatedSections] = useState(
    (operation?.relatedSections ?? []).join(", ")
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload: Record<string, unknown> = {
      order: order.trim() ? Number(order) : undefined,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      exampleQuery: exampleQuery.trim() || undefined,
      authRequired,
      prerequisites: linesToList(prerequisites),
      businessNotes: linesToList(businessNotes),
      relatedSections: csvToList(relatedSections),
    };

    const url =
      mode === "create"
        ? `/api/living-docs/projects/${slug}/operations`
        : `/api/living-docs/projects/${slug}/operations/${operation?.kind}/${operation?.name}`;

    if (mode === "create") {
      payload.kind = kind;
      payload.name = name;
    }

    try {
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responsePayload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(responsePayload.error ?? "Não foi possível salvar a operação.");
        return;
      }

      router.refresh();
      onDone();
    } catch {
      setError("Erro de rede ao salvar a operação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border border-slate-200 bg-slate-50 p-5"
    >
      <h3 className="text-sm font-semibold text-slate-900">
        {mode === "create" ? "Nova operação" : `Editando: ${operation?.kind}:${operation?.name}`}
      </h3>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="kind" className="block text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            id="kind"
            value={kind}
            disabled={mode === "edit"}
            onChange={(event) => setKind(event.target.value as ManualOperationKind)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            <option value="query">query</option>
            <option value="mutation">mutation</option>
          </select>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Nome (campo GraphQL)
          </label>
          <input
            id="name"
            required
            disabled={mode === "edit"}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm disabled:bg-slate-100"
            placeholder="ex.: listItems"
          />
        </div>
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-slate-700">
            Ordem
          </label>
          <input
            id="order"
            type="number"
            min={1}
            value={order}
            onChange={(event) => setOrder(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="auto"
          />
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">
          Título de exibição (opcional)
        </label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Descrição
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="exampleQuery" className="block text-sm font-medium text-slate-700">
          Exemplo GraphQL
        </label>
        <textarea
          id="exampleQuery"
          rows={5}
          value={exampleQuery}
          onChange={(event) => setExampleQuery(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="businessNotes" className="block text-sm font-medium text-slate-700">
            Regras de negócio (uma por linha)
          </label>
          <textarea
            id="businessNotes"
            rows={4}
            value={businessNotes}
            onChange={(event) => setBusinessNotes(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="prerequisites" className="block text-sm font-medium text-slate-700">
            Pré-requisitos (um por linha)
          </label>
          <textarea
            id="prerequisites"
            rows={4}
            value={prerequisites}
            onChange={(event) => setPrerequisites(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="relatedSections" className="block text-sm font-medium text-slate-700">
          Seções relacionadas (slugs separados por vírgula)
        </label>
        <input
          id="relatedSections"
          value={relatedSections}
          onChange={(event) => setRelatedSections(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
          placeholder="ex.: autenticacao, paginacao"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={authRequired}
          onChange={(event) => setAuthRequired(event.target.checked)}
          className="rounded border-slate-300"
        />
        Requer autenticação
      </label>

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
          {submitting ? "Salvando…" : "Salvar operação"}
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
