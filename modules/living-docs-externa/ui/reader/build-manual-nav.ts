import type { ManualSection, Project } from "@/modules/living-docs-externa/schema";
import {
  manualOperationKindSchema,
  sortOperations,
} from "@/modules/living-docs-externa/schema";
import {
  DOCS_HOME_HREF,
  docsGuideHref,
  docsOperationHref,
  docsPlaygroundHref,
} from "@/modules/living-docs-externa/services/docs-routes";
import type {
  ManualNavGroup,
  ManualTocItem,
} from "@/modules/living-docs-externa/ui/reader/manual-shell";
import { getPublishedManualSections } from "@/modules/living-docs-externa/services/get-published-manual-sections";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";

interface BuildManualNavOptions {
  kind?: string;
  name?: string;
  playground?: boolean;
  /** Quando a page já carregou o projeto, evita segunda leitura do CMS. */
  project?: Project;
  /** Quando a page já carregou seções (roteiro), evita reler `sections/*.md`. */
  sections?: ManualSection[];
}

export interface ManualNavData {
  sidebarGroups: ManualNavGroup[];
  tocItems: ManualTocItem[];
}

export async function buildManualNav(
  slug: string,
  options: BuildManualNavOptions = {},
): Promise<ManualNavData | null> {
  const { kind, name, playground, project: projectInput, sections: sectionsInput } =
    options;

  const project = projectInput ?? (await getPublishedManual(slug));
  if (!project) return null;

  const basePath = docsGuideHref(slug);
  const operations = sortOperations(project.manual);
  const sidebarGroups: ManualNavGroup[] = [
    {
      title: "Navegação",
      items: [
        { href: DOCS_HOME_HREF, label: "Documentação" },
        { href: basePath, label: "Roteiro", active: !playground && (!kind || !name) },
        { href: docsPlaygroundHref(slug), label: "Playground", active: !!playground },
      ],
    },
    {
      title: "Operações",
      items: operations.map((op) => {
        const href = docsOperationHref(slug, op.kind, op.name);
        return {
          href,
          label: op.title ?? `${op.kind.toUpperCase()} ${op.name}`,
          active: !playground && href === `${basePath}/operations/${kind}/${name}`,
        };
      }),
    },
  ];

  if (playground) {
    return { sidebarGroups, tocItems: [] };
  }

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

  const sections = sectionsInput ?? (await getPublishedManualSections(slug));
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
