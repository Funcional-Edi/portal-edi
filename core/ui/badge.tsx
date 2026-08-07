import type { ReactNode } from "react";

/**
 * Badge com tons semânticos. Antes, cada tela escrevia sua própria
 * `<span className="rounded-full bg-... px-2 py-0.5">` — sem padrão de cor
 * por significado, os badges (status, ambiente, gateway) ficavam quase
 * idênticos e difíceis de escanear (ver `docs/migracao/decisoes-ui.md`).
 */
export type BadgeTone = "brand" | "neutral" | "success" | "warning";

const TONE_CLASSES: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-700",
  neutral: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
