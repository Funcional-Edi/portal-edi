import Link from "next/link";

import { MarkdownBody } from "@/core/ui/markdown-body";
import type { InternoGuide } from "@/modules/manuais-internos/schema/guide";

interface GuideViewerProps {
  guide: InternoGuide;
}

export function GuideViewer({ guide }: GuideViewerProps) {
  return (
    <article>
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/interno" className="hover:text-brand-700">
          Guias internos
        </Link>
      </nav>
      <MarkdownBody source={guide.body} />
    </article>
  );
}
