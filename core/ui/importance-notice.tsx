import type { ReactNode } from "react";

export type ImportanceTone = "critical" | "attention" | "observation" | "comment";

const NOTICE_STYLES: Record<ImportanceTone, { label: string; className: string }> = {
  critical: { label: "Atenção máxima", className: "border-red-300 bg-red-50 text-red-900" },
  attention: { label: "Atenção", className: "border-amber-300 bg-amber-50 text-amber-900" },
  observation: { label: "Observação", className: "border-emerald-300 bg-emerald-50 text-emerald-900" },
  comment: { label: "Comentário", className: "border-sky-300 bg-sky-50 text-sky-900" },
};

export function ImportanceNotice({
  tone,
  children,
}: {
  tone: ImportanceTone;
  children: ReactNode;
}) {
  const style = NOTICE_STYLES[tone];

  return (
    <aside role="note" aria-label={style.label} className={`rounded-md border-l-4 px-4 py-3 ${style.className}`}>
      {children}
    </aside>
  );
}
