import type { ReactNode } from "react";

import { DocsShell } from "@/modules/living-docs-externa/ui/reader/docs-shell";
import { DOCS_API_HREF } from "@/modules/living-docs-externa/services/docs-routes";

interface DocsApiShellProps {
  children: ReactNode;
  subtitle?: string;
  activeHref?: string;
}

export function DocsApiShell({
  children,
  subtitle = "Referência GraphQL",
  activeHref = DOCS_API_HREF,
}: DocsApiShellProps) {
  return (
    <DocsShell subtitle={subtitle} activeHref={activeHref}>
      {children}
    </DocsShell>
  );
}
