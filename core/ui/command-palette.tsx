"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  SEARCH_RESULT_TYPE_LABELS,
  type SearchResult,
} from "@/core/search/types";

interface SearchApiResponse {
  results: SearchResult[];
}

/** Paleta de busca global (Ctrl+K / Cmd+K). */
export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActiveIndex(0);
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const modifier = isMac ? event.metaKey : event.ctrlKey;
      if (modifier && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) {
      const id = window.requestAnimationFrame(() => inputRef.current?.focus());
      return () => window.cancelAnimationFrame(id);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setResults([]);
          return;
        }
        const body = (await response.json()) as SearchApiResponse;
        setResults(body.results ?? []);
        setActiveIndex(0);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query]);

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      navigateTo(results[activeIndex].href);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-[12vh]"
      role="presentation"
      onClick={close}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Busca no portal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Buscar manuais, operações, seções…"
            className="w-full text-sm text-slate-900 outline-none placeholder:text-slate-400"
            aria-label="Termo de busca"
          />
          <kbd className="hidden rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500 sm:inline">
            Esc
          </kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto py-2" role="listbox">
          {loading ? (
            <li className="px-4 py-3 text-sm text-slate-500">Buscando…</li>
          ) : null}
          {!loading && query.trim().length >= 2 && results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">Nenhum resultado.</li>
          ) : null}
          {!loading && query.trim().length < 2 ? (
            <li className="px-4 py-3 text-sm text-slate-500">
              Digite ao menos 2 caracteres.
            </li>
          ) : null}
          {results.map((result, index) => (
            <li key={`${result.href}-${index}`}>
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={`flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition ${
                  index === activeIndex ? "bg-brand-50" : "hover:bg-slate-50"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => navigateTo(result.href)}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                    {SEARCH_RESULT_TYPE_LABELS[result.type]}
                  </span>
                  {result.title}
                </span>
                {result.snippet ? (
                  <span className="line-clamp-1 text-xs text-slate-500">{result.snippet}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
