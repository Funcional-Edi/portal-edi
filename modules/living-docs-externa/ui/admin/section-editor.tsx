"use client";

import { useRef, useState } from "react";

import type { ManualSection } from "@/modules/living-docs-externa/schema";
import { MarkdownBody } from "@/modules/living-docs-externa/ui/reader/markdown-body";

interface SectionEditorProps {
  slug: string;
  section: ManualSection;
  onSaved: (section: ManualSection) => void;
  onCancel: () => void;
}

/**
 * Editor inline de uma seção (etapa 6.3): textarea Markdown com toolbar básica
 * e preview lado a lado renderizado pelo MESMO `MarkdownBody` do leitor — o que
 * aparece aqui é literalmente o que o distribuidor vê.
 */
export function SectionEditor({ slug, section, onSaved, onCancel }: SectionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState(section.body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = body !== section.body;

  /** Envolve a seleção (ex.: **negrito**) ou insere o marcador no cursor. */
  function wrapSelection(before: string, after: string, placeholder: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const selected = body.slice(selectionStart, selectionEnd) || placeholder;
    const next = `${body.slice(0, selectionStart)}${before}${selected}${after}${body.slice(selectionEnd)}`;

    setBody(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        selectionStart + before.length,
        selectionStart + before.length + selected.length
      );
    });
  }

  /** Adiciona um prefixo no início de cada linha selecionada (heading, lista). */
  function prefixLines(prefix: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const lineStart = body.lastIndexOf("\n", selectionStart - 1) + 1;
    const lineEnd = body.indexOf("\n", selectionEnd) === -1 ? body.length : body.indexOf("\n", selectionEnd);

    const block = body.slice(lineStart, lineEnd) || "Novo item";
    const prefixed = block
      .split("\n")
      .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
      .join("\n");

    setBody(`${body.slice(0, lineStart)}${prefixed}${body.slice(lineEnd)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart + prefixed.length);
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/living-docs/projects/${slug}/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
        title?: string;
        body?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Não foi possível salvar a seção.");
        return;
      }

      onSaved({
        id: payload.id ?? section.id,
        title: payload.title ?? section.title,
        body: payload.body ?? body,
      });
    } catch {
      setError("Erro de rede ao salvar a seção.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <ToolbarButton label="Negrito" onClick={() => wrapSelection("**", "**", "texto")} />
        <ToolbarButton label="Título" onClick={() => prefixLines("## ")} />
        <ToolbarButton label="Lista" onClick={() => prefixLines("- ")} />
        <ToolbarButton label="Código" onClick={() => wrapSelection("`", "`", "codigo")} />
        <ToolbarButton
          label="Link"
          onClick={() => wrapSelection("[", "](https://)", "texto do link")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label
            htmlFor={`section-body-${section.id}`}
            className="mb-1 block text-xs font-semibold uppercase text-slate-500"
          >
            Markdown
          </label>
          <textarea
            id={`section-body-${section.id}`}
            ref={textareaRef}
            rows={16}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
            Preview do distribuidor
          </p>
          <div className="min-h-[10rem] rounded-md border border-slate-200 bg-slate-50 p-3">
            <MarkdownBody source={body} />
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar seção"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancelar
        </button>
        {dirty ? <span className="text-xs text-amber-700">Alterações não salvas</span> : null}
      </div>
    </div>
  );
}

function ToolbarButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
    >
      {label}
    </button>
  );
}
