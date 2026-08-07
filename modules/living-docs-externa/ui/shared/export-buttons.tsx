"use client";

interface ExportDownloadButtonProps {
  slug: string;
  format: "postman" | "insomnia";
  label?: string;
  disabled?: boolean;
  className?: string;
}

const FORMAT_LABELS: Record<ExportDownloadButtonProps["format"], string> = {
  postman: "Exportar Postman",
  insomnia: "Exportar Insomnia",
};

/** Dispara download JSON da API BFF de export (sem credenciais no arquivo). */
export function ExportDownloadButton({
  slug,
  format,
  label,
  disabled = false,
  className = "",
}: ExportDownloadButtonProps) {
  const href = `/api/living-docs/projects/${slug}/export/${format}`;
  const text = label ?? FORMAT_LABELS[format];

  return (
    <a
      href={href}
      download
      aria-disabled={disabled}
      className={
        disabled
          ? `pointer-events-none cursor-not-allowed opacity-50 ${className}`
          : `inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 ${className}`
      }
      onClick={(event) => {
        if (disabled) event.preventDefault();
      }}
    >
      {text}
    </a>
  );
}

interface ProjectExportActionsProps {
  slug: string;
  graphqlUrl?: string;
  compact?: boolean;
}

/** Botões Postman + Insomnia; desabilitados sem gateway conectado. */
export function ProjectExportActions({
  slug,
  graphqlUrl,
  compact = false,
}: ProjectExportActionsProps) {
  const disabled = !graphqlUrl;
  const buttonClass = compact ? "text-xs px-2 py-1" : "";

  return (
    <div className="flex flex-wrap gap-2">
      <ExportDownloadButton
        slug={slug}
        format="postman"
        disabled={disabled}
        className={buttonClass}
      />
      <ExportDownloadButton
        slug={slug}
        format="insomnia"
        disabled={disabled}
        className={buttonClass}
      />
    </div>
  );
}
