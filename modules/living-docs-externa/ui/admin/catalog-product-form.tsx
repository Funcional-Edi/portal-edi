"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CatalogProduct } from "@/modules/living-docs-externa/schema/catalog-product";
import { normalizeSlugInput } from "@/modules/living-docs-externa/schema/project";

interface CatalogProductFormProps {
  mode: "create" | "edit";
  product?: CatalogProduct;
  projectOptions: { slug: string; name: string }[];
}

export function CatalogProductForm({ mode, product, projectOptions }: CatalogProductFormProps) {
  const router = useRouter();
  const [id, setId] = useState(product?.id ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [order, setOrder] = useState(product ? String(product.order) : "");
  const [visible, setVisible] = useState(product?.visible ?? true);
  const [status, setStatus] = useState(product?.status ?? "no-documentation");
  const [tag, setTag] = useState(product?.tag ?? "");
  const [modules, setModules] = useState(
    (product?.modules ?? []).map((module) => ({
      id: module.id,
      label: module.label,
      order: String(module.order),
      projectSlug: module.projectSlug ?? "",
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function addModule() {
    setModules((current) => [
      ...current,
      { id: "", label: "", order: String(current.length + 1), projectSlug: "" },
    ]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(
        mode === "create" ? "/api/living-docs/catalog-products" : `/api/living-docs/catalog-products/${product?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "create"
              ? { id, name, description: description || undefined }
              : {
                  name,
                  description,
                  order: Number(order),
                  visible,
                  status,
                  tag: tag.trim() || undefined,
                  modules: modules.map((module) => ({
                    id: module.id,
                    label: module.label,
                    order: Number(module.order),
                    projectSlug: module.projectSlug || undefined,
                  })),
                },
          ),
        },
      );
      const payload = (await response.json()) as { error?: string; id?: string };
      if (!response.ok) {
        setError(payload.error ?? "Não foi possível salvar o produto.");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Erro de rede ao salvar o produto.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5">
      <div>
        <label htmlFor="id" className="block text-sm font-medium text-slate-700">Identificador</label>
        <input
          id="id"
          required
          disabled={mode === "edit"}
          value={id}
          onChange={(event) => setId(normalizeSlugInput(event.target.value))}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm disabled:bg-slate-100"
          placeholder="ex.: trade"
        />
        <p className="mt-1 text-xs text-slate-500">Não muda depois de criado. Vira a pasta do produto.</p>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome</label>
        <input
          id="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição</label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {mode === "edit" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-slate-700">Ordem no menu</label>
              <input
                id="order"
                type="number"
                min={1}
                required
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
              <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value as CatalogProduct["status"])}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="no-documentation">Sem documentação</option>
                <option value="development">Em desenvolvimento</option>
                <option value="published">Publicado</option>
                <option value="unavailable">Indisponível</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="tag" className="block text-sm font-medium text-slate-700">Etiqueta (opcional)</label>
            <input
              id="tag"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="ex.: A confirmar"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} />
            Visível no menu de documentação
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Integrações</h2>
              <button type="button" onClick={addModule} className="text-sm font-medium text-brand-700 hover:underline">
                Adicionar
              </button>
            </div>
            {modules.map((module, index) => (
              <div key={index} className="grid gap-2 rounded-md border border-slate-200 p-3">
                <input
                  aria-label={`Identificador da integração ${index + 1}`}
                  required
                  value={module.id}
                  onChange={(event) => {
                    const next = [...modules];
                    next[index] = { ...module, id: normalizeSlugInput(event.target.value) };
                    setModules(next);
                  }}
                  className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
                  placeholder="id"
                />
                <input
                  aria-label={`Nome da integração ${index + 1}`}
                  required
                  value={module.label}
                  onChange={(event) => {
                    const next = [...modules];
                    next[index] = { ...module, label: event.target.value };
                    setModules(next);
                  }}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Nome exibido"
                />
                <select
                  aria-label={`Manual da integração ${index + 1}`}
                  value={module.projectSlug}
                  onChange={(event) => {
                    const next = [...modules];
                    next[index] = { ...module, projectSlug: event.target.value };
                    setModules(next);
                  }}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Sem manual ainda</option>
                  {projectOptions.map((option) => (
                    <option key={option.slug} value={option.slug}>{option.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setModules(modules.filter((_, item) => item !== index))}
                  className="text-left text-sm font-medium text-red-700 hover:underline"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
      >
        {submitting ? "Salvando…" : mode === "create" ? "Criar produto" : "Salvar produto"}
      </button>
    </form>
  );
}
