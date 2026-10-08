import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";

import { CopyableCode } from "@/core/ui/copyable-code";
import { ImportanceNotice, type ImportanceTone } from "@/core/ui/importance-notice";

interface MarkdownBodyProps {
  /** Texto Markdown bruto (vindo do CMS em arquivos). */
  source: string;
  /** Ativa avisos coloridos apenas nos manuais que adotam essa convenção. */
  importanceNotices?: boolean;
}

function markdownText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(markdownText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return markdownText(node.props.children);
  return "";
}

function noticeTone(children: ReactNode): ImportanceTone | undefined {
  const match = markdownText(children).match(/^\s*(ATENÇÃO MÁXIMA|ATENÇÃO|OBSERVAÇÃO|COMENTÁRIO)\s*[:.—-]/i);
  if (!match) return undefined;
  switch (match[1].toLocaleUpperCase("pt-BR")) {
    case "ATENÇÃO MÁXIMA": return "critical";
    case "ATENÇÃO": return "attention";
    case "OBSERVAÇÃO": return "observation";
    default: return "comment";
  }
}

/** Converte Markdown → React (compartilhado entre módulos de documentação). */
export function MarkdownBody({ source, importanceNotices = false }: MarkdownBodyProps) {
  return (
    <div className="space-y-3 text-slate-700 [&_a]:text-brand-700 [&_a]:underline [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-slate-900 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:leading-relaxed [&_pre]:my-4 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_strong]:font-semibold [&_strong]:text-slate-900">
      <ReactMarkdown
        components={{
          pre: ({ children }) => {
            const code = Array.isArray(children) ? children[0] : children;
            const codeClassName = isValidElement<{ className?: string }>(code)
              ? code.props.className
              : undefined;
            return (
              <CopyableCode
                code={markdownText(children)}
                codeClassName={codeClassName}
                className="my-4 max-w-full overflow-x-auto"
              />
            );
          },
          ...(importanceNotices ? {
          blockquote: ({ children }) => {
            const tone = noticeTone(children);
            return tone ? (
              <ImportanceNotice tone={tone}>{children}</ImportanceNotice>
            ) : (
              <blockquote className="border-l-2 border-slate-300 pl-4 text-slate-600">{children}</blockquote>
            );
          },
          } : {}),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
