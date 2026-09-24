"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  normalizeSlugInput,
  type ProjectProtocol,
} from "@/modules/living-docs-externa/schema/project";

interface CreateProjectFormProps {
  products: { id: string; name: string }[];
}

export function CreateProjectForm({ products }: CreateProjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [protocol, setProtocol] = useState<ProjectProtocol>("graphql");
  const [graphqlUrl, setGraphqlUrl] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slug = normalizeSlugInput(name);
    if (slug.length < 2) {
      setError("O nome do subproduto precisa gerar um identificador com pelo menos 2 caracteres.");
      return;
    }

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
          productId,
          protocol,
          ...(protocol === "graphql" ? { graphqlUrl, login, password } : {}),
        }),
      });

      const payload = (await response.json()) as { error?: string; slug?: string };

      if (!response.ok) {
        setError(payload.error ?? "Não foi possível criar o projeto.");
        if (payload.slug) router.push(`/admin/projects/${payload.slug}`);
        return;
      }

      setPassword("");
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
        <label htmlFor="productId" className="block text-sm font-medium text-slate-700">
          Produto
        </label>
        <select
          id="productId"
          name="productId"
          required
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {products.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">Onde esta integração aparece no menu de documentação.</p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Subproduto
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={200}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="ex.: Canal Autorizador"
        />
        <p className="mt-1 text-xs text-slate-500">
          {normalizeSlugInput(name).length >= 2
            ? `Endereço gerado: /docs/${normalizeSlugInput(name)}`
            : "O endereço do manual é gerado a partir deste nome."}
        </p>
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

      {protocol === "graphql" ? (
        <>
          <div>
            <label htmlFor="graphqlUrl" className="block text-sm font-medium text-slate-700">
              URL da API (GraphQL)
            </label>
            <input
              id="graphqlUrl"
              name="graphqlUrl"
              type="url"
              required
              value={graphqlUrl}
              onChange={(event) => setGraphqlUrl(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
              placeholder="https://gateway.exemplo.com.br/graphql"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-slate-700">Login</label>
              <input
                id="login"
                name="login"
                required
                autoComplete="off"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Ao criar, o portal valida esse acesso, lê o schema e lista as requisições para você marcar.
            A senha fica só no servidor.
          </p>
        </>
      ) : null}

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
          {submitting
            ? "Buscando requisições…"
            : protocol === "graphql"
              ? "Criar e buscar requisições"
              : "Criar projeto"}
        </button>
      </div>
    </form>
  );
}
