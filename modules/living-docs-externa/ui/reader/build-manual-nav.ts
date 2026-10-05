import type { ManualSection, Project } from "@/modules/living-docs-externa/schema";
import { auth, isAdminRole } from "@/core/auth";
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
import { getPublishedOperationSchemaDetail } from "@/modules/living-docs-externa/services/get-published-schema";
import { getIntegrationFlows } from "@/modules/fluxogramas/public";

interface BuildManualNavOptions {
  kind?: string;
  name?: string;
  playground?: boolean;
  /** Quando a page já carregou o projeto, evita segunda leitura do CMS. */
  project?: Project;
  /** Quando a page já carregou seções (roteiro), evita reler `sections/*.md`. */
  sections?: ManualSection[];
  flowAvailable?: boolean;
}

export interface ManualNavData {
  sidebarGroups: ManualNavGroup[];
  tocItems: ManualTocItem[];
  hasTestScenarios: boolean;
}

export async function buildManualNav(
  slug: string,
  options: BuildManualNavOptions = {},
): Promise<ManualNavData | null> {
  const { kind, name, playground, project: projectInput, sections: sectionsInput, flowAvailable } =
    options;

  const project = projectInput ?? (await getPublishedManual(slug));
  if (!project) return null;
  const hasTestScenarios = Boolean(
    project.manual.homologationFlows?.length || project.manual.homologationValidations?.length
  );

  const basePath = docsGuideHref(slug);
  const session = await auth();
  const canUseRequestTest = session?.user?.role && isAdminRole(session.user.role)
    && project.config.protocol === "graphql";
  const operations = sortOperations(project.manual);
  const sidebarGroups: ManualNavGroup[] = [
    {
      title: "Navegação",
      items: [
        { href: DOCS_HOME_HREF, label: "Documentação" },
        { href: `${basePath}#jornada-integracao`, label: "Jornada da Integração", active: !playground && (!kind || !name) },
        ...(!kind && !playground && hasTestScenarios
          ? [{ href: `${basePath}#roteiro-integracao`, label: "Cenário de Teste" }]
          : []),
        ...(canUseRequestTest ? [{ href: docsPlaygroundHref(slug), label: "Teste de Requisição", active: !!playground }] : []),
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
    return { sidebarGroups, tocItems: [], hasTestScenarios };
  }

  const kindResult = kind ? manualOperationKindSchema.safeParse(kind) : null;

  if (kindResult?.success && name) {
    const operation = operations.find((op) => op.kind === kindResult.data && op.name === name);
    const tocItems: ManualTocItem[] = [];
    if (operation?.description) tocItems.push({ href: "#descricao", label: "Descrição" });
    if (operation?.businessNotes?.length)
      tocItems.push({ href: "#regras-negocio", label: "Regras de negócio" });

    const schemaDetail =
      kindResult.data === "rest"
        ? null
        : await getPublishedOperationSchemaDetail(slug, kindResult.data, name);
    if (schemaDetail) {
      if (schemaDetail.requestArgs.length > 0 || schemaDetail.requestInputTypes.length > 0) {
        tocItems.push({ href: "#campos-requisicao", label: "Campos da requisição" });
      }
      if (schemaDetail.responseFields.length > 0) {
        tocItems.push({ href: "#campos-resposta", label: "Campos da resposta" });
      }
    }

    if (operation?.referenceTableIds?.length) {
      tocItems.push({ href: "#tabelas-referencia", label: "Tabelas de referência" });
    }
    if (operation?.exampleQuery)
      tocItems.push({ href: "#exemplo-graphql", label: "Exemplo GraphQL" });
    return { sidebarGroups, tocItems, hasTestScenarios };
  }

  const [loadedSections, flows] = await Promise.all([
    sectionsInput ?? getPublishedManualSections(slug),
    getIntegrationFlows(slug),
  ]);
  const businessRulesSection = loadedSections.find((section) => section.id === "regras-de-negocios");
  const sections = loadedSections.filter(
    (section) => section.id !== "fluxo-do-pedido" && section.id !== "regras-de-negocios",
  );
  const tocItems: ManualTocItem[] = [];
  tocItems.push(...sections.map((section) => ({
    href: `#section-${section.id}`,
    label: section.title,
    depth: 1,
  })));
  if (flows.length > 0) {
    tocItems.push({ href: "#fluxogramas", label: "Fluxogramas", depth: 1 });
    tocItems.push(...flows.map((flow) => ({
      href: `/fluxogramas/${slug}?fluxo=${encodeURIComponent(flow.id)}`,
      label: flow.title,
      depth: 2,
    })));
  }
  if (businessRulesSection) {
    tocItems.push({
      href: "#section-regras-de-negocios",
      label: businessRulesSection.title,
      depth: 1,
    });
  }
  tocItems.push({ href: "#jornada-integracao", label: "Jornada da Integração" });
  tocItems.push(
    ...operations.flatMap((op) => {
      const href = `${basePath}/operations/${op.kind}/${op.name}`;
      return [
        {
          href,
          label: op.title ?? `${op.kind.toUpperCase()} ${op.name}`,
          depth: 1,
        },
        ...(op.referenceTableIds?.length
          ? [{ href: `${href}#tabelas-referencia`, label: "Tabelas de referência", depth: 2 }]
          : []),
      ];
    })
  );
  if (hasTestScenarios) {
    tocItems.push({ href: "#roteiro-integracao", label: "Cenário de Teste" });
  }
  if (project.manual.homologationFlows?.length) {
    tocItems.push(...project.manual.homologationFlows.map((flow) => ({
      href: `#roteiro-cenario-${flow.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
      label: flow.title,
      depth: 1,
    })));
  }
  if (project.manual.homologationValidations?.length) {
    tocItems.push({ href: "#roteiro-validacoes", label: "Validações", depth: 1 });
  }
  tocItems.push({ href: "#versao-subproduto", label: "Histórico de Alterações" });

  return {
    sidebarGroups,
    tocItems,
    hasTestScenarios,
  };
}
