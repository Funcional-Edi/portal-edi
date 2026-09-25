import ReactMarkdown from "react-markdown";

interface MarkdownBodyProps {
  /** Texto Markdown bruto (vindo do CMS em arquivos). */
  source: string;
}

/** Converte Markdown → React (compartilhado entre módulos de documentação). */
export function MarkdownBody({ source }: MarkdownBodyProps) {
  return (
    <div className="space-y-3 text-slate-700 [&_a]:text-brand-700 [&_a]:underline [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-slate-900 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:leading-relaxed [&_pre]:my-4 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_strong]:font-semibold [&_strong]:text-slate-900">
      <ReactMarkdown>{source}</ReactMarkdown>
    </div>
  );
}
