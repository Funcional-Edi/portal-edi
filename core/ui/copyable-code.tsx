"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyToClipboardButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyToClipboardButton({
  text,
  label = "Copiar código",
  className = "",
}: CopyToClipboardButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    window.setTimeout(() => setStatus("idle"), 1800);
  }

  const statusLabel = status === "copied" ? "Copiado" : status === "error" ? "Falha ao copiar" : label;

  return (
    <button
      type="button"
      aria-label={statusLabel}
      title={statusLabel}
      disabled={!text.trim()}
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-700 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {status === "copied" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      <span aria-live="polite">{statusLabel}</span>
    </button>
  );
}

interface CopyableCodeProps {
  code: string;
  className: string;
  codeClassName?: string;
}

export function CopyableCode({ code, className, codeClassName }: CopyableCodeProps) {
  return (
    <div className="relative">
      <pre className={className} style={{ paddingTop: "3rem" }}>
        <code className={codeClassName}>{code}</code>
      </pre>
      <CopyToClipboardButton text={code} className="absolute right-2 top-2" />
    </div>
  );
}
