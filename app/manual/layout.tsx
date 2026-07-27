import { ManualShell } from "@/modules/living-docs-externa/ui/reader/manual-shell";
import { manualOperationKindSchema, sortOperations } from "@/modules/living-docs-externa/schema";
import { getPublishedManualSections } from "@/modules/living-docs-externa/services/get-published-manual-sections";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";

interface ManualLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug?: string; kind?: string; name?: string }>;
}

export default async function ManualLayout({ children, params }: ManualLayoutProps) {
  const { slug, kind, name } = await params;

  if (!slug) {
    return <ManualShell>{children}</ManualShell>;
  }

  const project = await getPublishedManual(slug);
  if (!project) {
    return <ManualShell>{children}</ManualShell>;
  }

  const basePath = `/manual/${slug}`;
  const operations = sortOperations(project.manual);
  const sidebarGroups = [
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

  let tocItems: Array<{ href: string; label: string }> = [];
  const kindResult = kind ? manualOperationKindSchema.safeParse(kind) : null;

  if (kindResult?.success && name) {
    const operation = operations.find((op) => op.kind === kindResult.data && op.name === name);
    if (operation?.description) tocItems.push({ href: "#descricao", label: "Descrição" });
    if (operation?.businessNotes?.length)
      tocItems.push({ href: "#regras-negocio", label: "Regras de negócio" });
    if (operation?.exampleQuery)
      tocItems.push({ href: "#exemplo-graphql", label: "Exemplo GraphQL" });
  } else {
    const sections = await getPublishedManualSections(slug);
    if (sections.length > 0) tocItems.push({ href: "#contexto", label: "Contexto" });
    if (project.manual.referenceTables?.length)
      tocItems.push({ href: "#tabelas-referencia", label: "Tabelas de referência" });
    tocItems.push({ href: "#roteiro-integracao", label: "Roteiro de integração" });

    tocItems = [
      ...tocItems,
      ...operations.map((op) => ({
        href: `${basePath}/operations/${op.kind}/${op.name}`,
        label: op.title ?? `${op.kind.toUpperCase()} ${op.name}`,
      })),
    ];
  }

  return (
    <ManualShell sidebarGroups={sidebarGroups} tocItems={tocItems}>
      {children}
    </ManualShell>
  );
}
