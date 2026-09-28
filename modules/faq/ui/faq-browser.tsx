"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MarkdownBody } from "@/core/ui/markdown-body";
import type { FaqEntry } from "@/modules/faq/schema/faq";

interface FaqBrowserProps {
  entries: FaqEntry[];
}

export function FaqBrowser({ entries }: FaqBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");

  const categories = [...new Set(entries.map((entry) => entry.category))];
  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

    return entries.filter((entry) => {
      if (category !== "Todas" && entry.category !== category) return false;
      if (!normalizedQuery) return true;

      return [entry.question, entry.category, entry.body]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedQuery);
    });
  }, [category, entries, query]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="block text-sm font-medium text-slate-700">
          Buscar no FAQ
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: homologação, token, produto..."
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Categoria
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          >
            <option>Todas</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <p className="text-sm text-slate-500" aria-live="polite">
        {filteredEntries.length} {filteredEntries.length === 1 ? "resposta encontrada" : "respostas encontradas"}
      </p>

      {filteredEntries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          Não encontramos uma resposta com esses filtros. Consulte a documentação do produto ou refine a busca.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <details key={entry.slug} className="group rounded-xl border border-slate-200 bg-white shadow-sm">
              <summary className="cursor-pointer list-none px-5 py-4 text-left outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600">
                <span className="flex items-start justify-between gap-4">
                  <span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">{entry.category}</span>
                    <span className="mt-1 block font-semibold text-slate-900">{entry.question}</span>
                  </span>
                  <span aria-hidden="true" className="mt-1 text-xl leading-none text-brand-700 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <div className="border-t border-slate-100 px-5 py-4">
                <MarkdownBody source={entry.body} />
                {entry.relatedLinks.length > 0 ? (
                  <nav aria-label={`Links relacionados a ${entry.question}`} className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Consulte também</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {entry.relatedLinks.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} className="inline-flex rounded-full border border-brand-200 px-3 py-1.5 text-sm text-brand-700 transition hover:border-brand-600 hover:bg-brand-50">
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
