"use client";

import { useEffect, type ReactNode } from "react";

interface SlideOverProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Painel lateral do editor (etapa 6.4). Serve para editar operações sem sair da
 * página do manual — o roteiro fica visível atrás, mantendo o contexto visual.
 */
export function SlideOver({ title, onClose, children }: SlideOverProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-label={title}>
      <button
        type="button"
        aria-label="Fechar painel"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30"
      />
      <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Fechar
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
