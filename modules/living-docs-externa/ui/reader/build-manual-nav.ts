import { manualOperationKindSchema, sortOperations } from "@/modules/living-docs-externa/schema";
import type {
  ManualNavGroup,
  ManualTocItem,
} from "@/modules/living-docs-externa/ui/reader/manual-shell";
import { getPublishedManualSections } from "@/modules/living-docs-externa/services/get-published-manual-sections";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";

interface BuildManualNavOptions {
  kind?: string;
  name?: string;
}

export interface ManualNavData {
  sidebarGroups: ManualNavGroup[];
  tocItems: ManualTocItem[];
}

export async function buildManualNav(
  slug: string,
  options: BuildManualNavOptions = {},
): Promise<ManualNavData | null> {
  const { kind, name } = options;
  const project = await getPublishedManual(slug);
  if (!project) return null;

  const basePath = `/manual/${slug}`;
  const operations = sortOperations(project.manual);
  const sidebarGroups: ManualNavGroup[] = [
    {
      title: "Navegação",
      items: [
        { href: "/manual", label: "Catálogo" },
        { href: basePath, label: "Roteiro", active: !kind || !name },
      ],
    },
    {
      title: "Operações",
      items: operations.map((op) => {
        const href = `${basePath}/operations/${op.kind}/${op.name}`;
        return {
          href,
          label: op.title ?? `${op.kind.toUpperCase()} ${op.name}`,
          active: href === `${basePath}/operations/${kind}/${name}`,
        };
      }),
    },
  ];

  const kindResult = kind ? manualOperationKindSchema.safeParse(kind) : null;

  if (kindResult?.success && name) {
    const operation = operations.find((op) => op.kind === kindResult.data && op.name === name);
    const tocItems: ManualTocItem[] = [];
    if (operation?.description) tocItems.push({ href: "#descricao", label: "Descrição" });
    if (operation?.businessNotes?.length)
      tocItems.push({ href: "#regras-negocio", label: "Regras de negócio" });
    if (operation?.exampleQuery)
      tocItems.push({ href: "#exemplo-graphql", label: "Exemplo GraphQL" });
    return { sidebarGroups, tocItems };
  }

  const sections = await getPublishedManualSections(slug);
  const tocItems: ManualTocItem[] = [];
  if (sections.length > 0) tocItems.push({ href: "#contexto", label: "Contexto" });
  if (project.manual.referenceTables?.length)
    tocItems.push({ href: "#tabelas-referencia", label: "Tabelas de referência" });
  tocItems.push({ href: "#roteiro-integracao", label: "Roteiro de integração" });

  return {
    sidebarGroups,
    tocItems: [
      ...tocItems,
      ...operations.map((op) => ({
        href: `${basePath}/operations/${op.kind}/${op.name}`,
        label: op.title ?? `${op.kind.toUpperCase()} ${op.name}`,
      })),
    ],
  };
}
