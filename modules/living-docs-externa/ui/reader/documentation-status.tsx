import { Badge, type BadgeTone } from "@/core/ui/badge";
import type { DocumentationStatus } from "@/modules/living-docs-externa/schema/documentation-navigation";

const STATUS_PRESENTATION: Record<DocumentationStatus, { label: string; tone: BadgeTone }> = {
  published: { label: "Publicado", tone: "success" },
  "no-documentation": { label: "Sem documentação", tone: "neutral" },
  development: { label: "Em desenvolvimento", tone: "warning" },
  unavailable: { label: "Indisponível", tone: "neutral" },
};

export function DocumentationStatusBadge({ status }: { status: DocumentationStatus }) {
  const { label, tone } = STATUS_PRESENTATION[status];
  return <Badge tone={tone}>{label}</Badge>;
}
