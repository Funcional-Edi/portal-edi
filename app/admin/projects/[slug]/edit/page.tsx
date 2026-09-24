import Link from "next/link";
import { notFound } from "next/navigation";

import { getProject } from "@/modules/living-docs-externa/repository/project-repository";
import { listManualSections } from "@/modules/living-docs-externa/repository/section-repository";
import { evaluateManualQuality } from "@/modules/living-docs-externa/services/manual-quality";
import { ManualEditor } from "@/modules/living-docs-externa/ui/admin/manual-editor";
import {
  ManualShell,
  type ManualNavGroup,
  type ManualTocItem,
} from "@/modules/living-docs-externa/ui/reader/manual-shell";

interface EditManualPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Editor canônico do manual (etapa 6.1).
 *
 * Usa o shell do leitor (`ManualShell`) e lê direto do repositório — sem o gate
 * de `published` dos services de leitura — porque o admin precisa editar
 * rascunho. O acesso admin é garantido pelo `middleware.ts`.
 */
export default async function EditManualPage({ params }: EditManualPageProps) {
  const { slug } = await params;

  const project = await getProject(slug);
  if (!project) notFound();

  const sections = await listManualSections(slug);
  const report = evaluateManualQuality({
    config: project.config,
    manual: project.manual,
    sections,
  });

  const sidebarGroups: ManualNavGroup[] = [
    {
      title: "Admin",
      items: [
        { href: "/admin/projects", label: "Projetos" },
        { href: `/admin/projects/${slug}`, label: "Configurações" },
        { href: `/admin/projects/${slug}/edit`, label: "Editor do manual", active: true },
      ],
    },
    {
      title: "Seções",
      items: sections.map((section) => ({
        href: `#section-${section.id}`,
        label: section.title,
      })),
    },
  ];

  const tocItems: ManualTocItem[] = [
    { href: "#contexto", label: "Contexto" },
    ...(project.manual.referenceTables?.length
      ? [{ href: "#tabelas-referencia", label: "Tabelas de referência" }]
      : []),
    { href: "#jornada-integracao", label: "Jornada da Integração" },
    { href: "#roteiro-integracao", label: "Roteiro de Integração" },
  ];

  return (
    <ManualShell
      sidebarGroups={sidebarGroups}
      tocItems={tocItems}
      subtitle={`Editor do manual — ${project.config.name}`}
      headerActions={
        <Link
          href="/admin/projects"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          Admin
        </Link>
      }
    >
      <ManualEditor project={project} sections={sections} report={report} />
    </ManualShell>
  );
}
