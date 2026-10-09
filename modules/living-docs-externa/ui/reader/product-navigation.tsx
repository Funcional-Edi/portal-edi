"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Code2,
  FileText,
  Menu,
  Route,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Badge, environmentBadgeTone } from "@/core/ui/badge";
import { HorizontalDragNav } from "@/core/ui/horizontal-drag-nav";
import type {
  DocumentationActionView,
  DocumentationLinkView,
  DocumentationNavigationView,
  DocumentationOperationView,
  DocumentationProductView,
} from "@/modules/living-docs-externa/schema/documentation-navigation";
import { documentationRouteSelection } from "@/modules/living-docs-externa/services/documentation-navigation";
import { docsGuideHref, docsReturnHref } from "@/modules/living-docs-externa/services/docs-routes";
import { DocumentationStatusBadge as StatusBadge } from "@/modules/living-docs-externa/ui/reader/documentation-status";
import type { ManualTocItem } from "@/modules/living-docs-externa/ui/reader/manual-shell";

const focusClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2";

const FLOW_AREAS = [
  { id: "documentacao", label: "Documentação", icon: FileText },
  { id: "jornada-integracao", label: "Jornada da Integração", icon: Route },
  { id: "roteiro-integracao", label: "Cenário de Teste", icon: BookOpen },
  { id: "queries", label: "Queries", icon: Code2 },
  { id: "mutations", label: "Mutations", icon: Code2 },
  { id: "metodos", label: "Métodos", icon: Code2 },
  { id: "teste-de-requisicao", label: "Teste de Requisição", icon: ArrowRight },
] as const;

type ProductAreaId = "visao-geral" | "fluxograma-geral" | "roteiro-homologacao" | "jornada-integracao" | "roteiro-integracao" | "teste-de-requisicao";
type FlowAreaId = (typeof FLOW_AREAS)[number]["id"];

function flowAreaHref(product: DocumentationProductView, link: DocumentationLinkView, areaId: FlowAreaId) {
  if (areaId === "documentacao") {
    return product.actions.find((action) => action.id === "visao-geral")?.links.find((item) => item.id === link.id)?.href;
  }
  if (areaId === "jornada-integracao") {
    return product.actions.find((action) => action.id === areaId)?.links.find((item) => item.id === link.id)?.href;
  }
  if (areaId === "roteiro-integracao") {
    return product.actions.find((action) => action.id === areaId)?.links.find((item) => item.id === link.id)?.href;
  }
  if (areaId === "teste-de-requisicao") {
    return product.actions.find((action) => action.id === "teste-de-requisicao")?.links.find((item) => item.id === link.id)?.href;
  }
  return null;
}

function availableFlowAreas(product: DocumentationProductView, link: DocumentationLinkView) {
  const operations = link.operations ?? [];
  const operationsInJourney = Boolean(flowAreaHref(product, link, "jornada-integracao"))
    && operations.length > 0;
  return FLOW_AREAS.filter((area) => {
    if (operationsInJourney && (area.id === "queries" || area.id === "mutations")) return false;
    if (area.id === "documentacao" || area.id === "jornada-integracao" || area.id === "roteiro-integracao" || area.id === "teste-de-requisicao") {
      return Boolean(flowAreaHref(product, link, area.id));
    }
    const kind = area.id === "queries" ? "query" : area.id === "mutations" ? "mutation" : "rest";
    return operations.some((operation) => operation.kind === kind);
  });
}

function tocDesktopIndent(depth?: number): string {
  if (depth && depth > 1) return "ml-8 border-l-2 border-slate-200 pl-3 ";
  if (depth) return "ml-4 border-l-2 border-slate-200 pl-3 ";
  return "";
}

function tocMobileIndent(depth?: number): string {
  if (depth && depth > 1) return "ml-4 ";
  if (depth) return "ml-2 ";
  return "";
}

function contextualTocItems({
  items,
  areaId,
  product,
  link,
  pathname,
}: {
  items: ManualTocItem[];
  areaId: ProductAreaId | FlowAreaId | null;
  product: DocumentationProductView | undefined;
  link: DocumentationLinkView | null;
  pathname: string;
}): ManualTocItem[] {
  if (!product || !link || !areaId) return [];

  const isOperationPage = pathname.includes("/operations/");
  if (isOperationPage && (areaId === "queries" || areaId === "mutations" || areaId === "metodos")) {
    return items;
  }

  if (areaId === "documentacao") {
    return items.filter((item) => item.href.startsWith("#section-")
      || item.href === "#fluxogramas"
      || item.href.startsWith("/fluxogramas/")
      || item.href === "#versao-subproduto");
  }

  if (areaId === "jornada-integracao") {
    return [
      ...items.filter((item) => item.href === "#jornada-integracao"),
      ...items.filter((item) => item.href === "#jornada-autenticacao-token"),
      ...items.filter((item) => item.href.startsWith("#jornada-operacao-")),
    ];
  }

  if (areaId === "roteiro-integracao") {
    return [
      ...items.filter((item) => item.href === "#roteiro-integracao"),
      ...items.filter((item) => item.href.startsWith("#roteiro-cenario-")
        || item.href === "#roteiro-validacoes"),
    ];
  }

  if (areaId === "queries" || areaId === "mutations" || areaId === "metodos") {
    const kind = areaId === "queries" ? "query" : areaId === "mutations" ? "mutation" : "rest";
    return (link.operations ?? [])
      .filter((operation) => operation.kind === kind)
      .map((operation) => ({ href: operation.href, label: operation.label, depth: 1 }));
  }

  return [];
}

function ActionStatus({ action }: { action: DocumentationActionView }) {
  return action.status !== "published" || action.tag ? (
    <span className="mt-1.5 flex flex-wrap gap-1">
      {action.status !== "published" ? <StatusBadge status={action.status} /> : null}
      {action.tag ? <Badge>{action.tag}</Badge> : null}
    </span>
  ) : null;
}

function Placeholder({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status="no-documentation" />
        <p className="text-sm font-medium text-slate-700">{children}</p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        A estrutura está reservada para conteúdo futuro e não representa uma rota disponível.
      </p>
    </div>
  );
}

function FlowchartList({ links }: { links: DocumentationLinkView[] }) {
  const available = links.filter((link) => link.href);

  if (available.length === 0) {
    return <Placeholder>Este produto ainda não possui um fluxograma completo publicado.</Placeholder>;
  }

  return (
    <div>
      <p className="text-sm leading-relaxed text-slate-600">
        Selecione o fluxograma completo do subproduto para visualizar a sequência de integração.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {available.map((link) => (
          <li key={link.id}>
            <Link
              href={link.href!}
              className={"block rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm transition hover:border-brand-600 hover:bg-brand-50 " + focusClass}
            >
              <span className="font-semibold text-slate-900">{link.label}</span>
              {link.environment ? (
                <span className="mt-2 block text-xs uppercase tracking-wide text-slate-500">{link.environment}</span>
              ) : null}
              <span className="mt-3 block font-medium text-brand-700">Ver fluxograma →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OperationList({
  title,
  operations,
}: {
  title: string;
  operations: DocumentationOperationView[];
}) {
  if (operations.length === 0) {
    return <Placeholder>{"Nenhuma " + title.toLowerCase() + " documentada neste fluxo."}</Placeholder>;
  }

  return (
    <section aria-labelledby={"operations-" + title.toLowerCase()}>
      <h4 id={"operations-" + title.toLowerCase()} className="text-sm font-semibold text-slate-800">{title}</h4>
      <ol className="mt-2 space-y-1.5">
        {operations.map((operation, index) => (
          <li key={operation.kind + "-" + operation.name}>
            <Link
              href={operation.href}
              className={[
                "flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-brand-400 hover:bg-brand-50",
                focusClass,
              ].join(" ")}
            >
              <span className="min-w-0">
                <span className="mr-2 text-xs font-semibold text-slate-400">{index + 1}.</span>
                {operation.label}
              </span>
              {operation.method ? <Badge tone="neutral">{operation.method}</Badge> : null}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

type CredenciadoStructureItem = {
  label: string;
  areaId?: ProductAreaId;
};

const CREDENCIADO_STRUCTURE = [
  { label: "Visão Geral", areaId: "visao-geral" },
  { label: "Fluxograma Completo", areaId: "fluxograma-geral" },
  { label: "Roteiro de Homologação", areaId: "roteiro-homologacao" },
] satisfies readonly CredenciadoStructureItem[];

function CredenciadoStructureItem({
  item,
  selectedAreaId,
  onSelectArea,
}: {
  item: CredenciadoStructureItem;
  selectedAreaId: ProductAreaId | FlowAreaId | null;
  onSelectArea: (areaId: ProductAreaId) => void;
}) {
  return (
    <li>
      {item.areaId ? (
        <button
          type="button"
          aria-pressed={item.areaId === selectedAreaId}
          onClick={() => onSelectArea(item.areaId!)}
          className={[
            "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
            focusClass,
            item.areaId === selectedAreaId ? "bg-brand-50 font-semibold text-brand-800" : "text-slate-700 hover:bg-slate-100 hover:text-brand-800",
          ].join(" ")}
        >
          {item.label}
        </button>
      ) : (
        <p className="px-3 py-2 text-sm font-medium text-slate-800">{item.label}</p>
      )}
    </li>
  );
}

function CredenciadoStructureNavigation({
  selectedAreaId,
  onSelectArea,
}: {
  selectedAreaId: ProductAreaId | FlowAreaId | null;
  onSelectArea: (areaId: ProductAreaId) => void;
}) {
  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Estrutura do Credenciado</p>
      <ul className="mt-2 space-y-1.5">
        {CREDENCIADO_STRUCTURE.map((item) => (
          <CredenciadoStructureItem
            key={item.label}
            item={item}
            selectedAreaId={selectedAreaId}
            onSelectArea={onSelectArea}
          />
        ))}
      </ul>
    </div>
  );
}

function FlowPanel({
  product,
  link,
  areaId,
  routeContent,
  returnTo,
  isReferenceContext,
}: {
  product: DocumentationProductView;
  link: DocumentationLinkView;
  areaId: FlowAreaId;
  routeContent?: ReactNode;
  returnTo?: string;
  isReferenceContext: boolean;
}) {
  const operations = link.operations ?? [];
  const journeyHref = link.projectSlug && isReferenceContext
    ? docsReturnHref(link.projectSlug, returnTo)
    : `/docs?produto=${encodeURIComponent(product.id)}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <nav aria-label="Contexto atual" className="text-xs text-slate-500">
            <Link href="/docs" className={"hover:text-brand-700 " + focusClass}>Documentação</Link>
            <span className="mx-1" aria-hidden="true">/</span>
            <Link href={`/docs?produto=${encodeURIComponent(product.id)}`} className={"hover:text-brand-700 " + focusClass}>{product.label}</Link>
            <span className="mx-1" aria-hidden="true">/</span>
            <span>{link.label}</span>
          </nav>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{link.label}</h3>
        </div>
        <Link href={journeyHref} className={"inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline " + focusClass}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {link.projectSlug && isReferenceContext ? "Voltar para a etapa da Jornada de Integração" : `Voltar ao produto ${product.label}`}
        </Link>
      </div>

      {routeContent != null ? <div className="mt-5">{routeContent}</div> : <div className="mt-5">
        {areaId === "queries" ? <OperationList title="Queries" operations={operations.filter((operation) => operation.kind === "query")} /> : null}
        {areaId === "mutations" ? <OperationList title="Mutations" operations={operations.filter((operation) => operation.kind === "mutation")} /> : null}
        {areaId === "metodos" ? <OperationList title="Métodos" operations={operations.filter((operation) => operation.kind === "rest")} /> : null}
      </div>}
    </div>
  );
}

function CredenciadoHomologationGuide({ links }: { links: DocumentationLinkView[] }) {
  const manuals = links.filter((link) => link.projectSlug && link.status === "published");

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-lg font-semibold text-slate-900">Roteiro de Homologação</h4>
          <Badge>Em preparação</Badge>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Siga os cenários do subproduto integrado, registre os resultados no relatório de homologação
          e encaminhe o documento preenchido ao responsável do time de EDI.
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h5 className="font-semibold text-slate-900">Passo a passo</h5>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
          <li>Abra o roteiro de teste correspondente ao seu subproduto e execute os cenários na ordem indicada.</li>
          <li>Realize as chamadas no ambiente de homologação, respeitando pré-requisitos e autenticação.</li>
          <li>Registre no relatório cada teste executado, o resultado obtido e as evidências solicitadas.</li>
          <li>Envie o relatório preenchido ao contato de EDI responsável pela implantação.</li>
        </ol>
      </section>

      <section aria-labelledby="credenciado-homologation-flows">
        <h5 id="credenciado-homologation-flows" className="font-semibold text-slate-900">
          Cenários por subproduto
        </h5>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {manuals.map((link) => (
            <li key={link.id}>
              <Link
                href={`${docsGuideHref(link.projectSlug!)}#roteiro-integracao`}
                className={["block rounded-lg border border-slate-200 bg-white p-4 text-sm transition hover:border-brand-600 hover:bg-brand-50", focusClass].join(" ")}
              >
                <span className="font-medium text-slate-900">{link.label}</span>
                <span className="mt-2 block text-brand-700">Abrir cenários de teste →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-100 p-4">
        <h5 className="font-semibold text-slate-900">Relatório de homologação (DOCX)</h5>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          O modelo para download será disponibilizado após validação com o time de EDI.
          Use-o para preencher os resultados e evidências de todos os cenários executados.
        </p>
        <button
          type="button"
          disabled
          className="mt-3 cursor-not-allowed rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500"
        >
          Documento em preparação
        </button>
      </section>

      <section aria-labelledby="credenciado-homologation-contact" className="rounded-lg border border-brand-200 bg-brand-50 p-4">
        <h5 id="credenciado-homologation-contact" className="font-semibold text-brand-900">
          Contato do time de EDI
        </h5>
        <p className="mt-1 text-sm leading-relaxed text-brand-900">
          Os dados de contato e o canal de envio serão informados após alinhamento com o time responsável.
        </p>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="font-medium text-brand-900">Responsável</dt><dd className="text-brand-800">A definir</dd></div>
          <div><dt className="font-medium text-brand-900">E-mail/canal para envio</dt><dd className="text-brand-800">A definir</dd></div>
        </dl>
      </section>
    </div>
  );
}

export function ProductNavigation({
  navigation,
  tocItems = [],
  hasTestScenarios = false,
  children,
}: {
  navigation: DocumentationNavigationView;
  tocItems?: { href: string; label: string; depth?: number }[];
  hasTestScenarios?: boolean;
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<ProductAreaId | FlowAreaId | null>(null);
  const [locationHash, setLocationHash] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const active = documentationRouteSelection(navigation, pathname, locationHash);
  const activeProductId = active?.productId;
  const activeModuleId = active?.moduleId;
  const activeActionId = active?.actionId;
  const requestedProductId = searchParams.get("produto");
  const productIdFromQuery = navigation.products.some((item) => item.id === requestedProductId) ? requestedProductId : null;

  useEffect(() => {
    const updateHash = () => setLocationHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  useEffect(() => {
    const updateScrollState = () => setShowScrollTop(window.scrollY > 480);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (activeProductId && activeModuleId && activeActionId) {
      setSelectedProductId(activeProductId);
      setSelectedFlowId(activeModuleId);
      setSelectedAreaId(activeActionId as ProductAreaId | FlowAreaId);
      return;
    }
    if (productIdFromQuery) {
      setSelectedProductId(productIdFromQuery);
      setSelectedFlowId(null);
      setSelectedAreaId("visao-geral");
      return;
    }
    setSelectedProductId(null);
    setSelectedFlowId(null);
    setSelectedAreaId(null);
  }, [activeActionId, activeModuleId, activeProductId, productIdFromQuery]);

  const product = navigation.products.find((item) => item.id === selectedProductId);
  const flows = product?.actions.find((action) => action.id === "fluxos")?.links ?? [];
  const visibleFlows = flows;
  const selectedFlow = flows.find((link) => link.id === selectedFlowId) ?? null;
  const productArea = product?.actions.find((action) => action.id === selectedAreaId);
  const flowAreas = product && selectedFlow
    ? availableFlowAreas(product, selectedFlow).filter((area) => area.id !== "roteiro-integracao" || hasTestScenarios)
    : [];
  const showRouteContent = children != null
    && activeProductId === selectedProductId
    && activeModuleId === selectedFlowId
    && activeActionId === selectedAreaId;

  useEffect(() => {
    if (locationHash !== "#versao-subproduto" || !showRouteContent) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("versao-subproduto")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [locationHash, showRouteContent]);

  const visibleTocItems = contextualTocItems({
    items: tocItems,
    areaId: selectedAreaId,
    product,
    link: selectedFlow,
    pathname,
  });
  const isOperationListArea = selectedAreaId === "queries"
    || selectedAreaId === "mutations"
    || selectedAreaId === "metodos";
  const showIndex = visibleTocItems.length > 0
    && (showRouteContent || (selectedFlow != null && isOperationListArea && !pathname.includes("/operations/")));

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
        <div>
          <Link href="/docs" className={"text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-brand-700 " + focusClass}>Documentação</Link>
          <p className="mt-1 text-sm font-semibold text-slate-900">Produtos EDI</p>
        </div>
        <button
          type="button"
          aria-label="Mostrar produtos"
          aria-expanded={mobileOpen}
          aria-controls="edi-product-list"
          onClick={() => setMobileOpen(!mobileOpen)}
          className={"rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden " + focusClass}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="p-4">
        <div className={`grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] ${showIndex ? "xl:grid-cols-[14rem_minmax(0,1fr)_13rem]" : ""}`}>
          <nav id="edi-product-list" aria-label="Produtos EDI" className={(mobileOpen ? "block" : "hidden") + " lg:sticky lg:top-6 lg:block lg:self-start"}>
            {selectedFlow && product ? (
              <>
                <Link href="/docs" className={"mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline " + focusClass}>
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Voltar aos produtos
                </Link>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{selectedFlow.label}</p>
                <div className="space-y-1.5">
                  {flowAreas.map((area) => {
                    const Icon = area.icon;
                    const href = flowAreaHref(product, selectedFlow, area.id);
                    const className = [
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm",
                      focusClass,
                      area.id === selectedAreaId ? "bg-brand-50 font-semibold text-brand-800" : "text-slate-700 hover:bg-slate-100",
                    ].join(" ");
                    const content = <>
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {area.label}
                    </>;
                    return href ? (
                      <Link
                        key={area.id}
                        href={href}
                        replace={area.id === "jornada-integracao"}
                        aria-current={area.id === selectedAreaId ? "page" : undefined}
                        onClick={() => setLocationHash(area.id === "jornada-integracao" || area.id === "roteiro-integracao" ? `#${area.id}` : "")}
                        className={className}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        key={area.id}
                        type="button"
                        aria-pressed={area.id === selectedAreaId}
                        onClick={() => setSelectedAreaId(area.id)}
                        className={className}
                      >
                        {content}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : product ? (
              <>
                <Link href="/docs" className={"mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline " + focusClass}>
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Produtos
                </Link>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{product.label}</p>
                <div className="mb-3 flex flex-wrap gap-1 px-3">
                  {product.status !== "published" ? <StatusBadge status={product.status} /> : null}
                  {product.tag ? <Badge>{product.tag}</Badge> : null}
                </div>
                <div className="space-y-1.5">
                  {product.actions
                    .filter((action) => action.id !== "fluxos" && action.id !== "jornada-integracao" && action.id !== "teste-de-requisicao")
                    .filter((action) => action.id !== "roteiro-integracao" || hasTestScenarios)
                    .filter((action) => product.id !== "credenciado" || (action.id !== "visao-geral" && action.id !== "fluxograma-geral"))
                    .map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        aria-pressed={action.id === selectedAreaId}
                        onClick={() => setSelectedAreaId(action.id as ProductAreaId)}
                        className={[
                          "block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                          focusClass,
                          action.id === selectedAreaId ? "bg-brand-50 font-semibold text-brand-800" : "text-slate-700 hover:bg-slate-100 hover:text-brand-800",
                        ].join(" ")}
                      >
                        <span>
                          <span className="block">{action.label}</span>
                          <ActionStatus action={action} />
                        </span>
                      </button>
                    ))}
                  {product.id === "credenciado" ? (
                    <CredenciadoStructureNavigation
                      selectedAreaId={selectedAreaId}
                      onSelectArea={setSelectedAreaId}
                    />
                  ) : null}
                  {visibleFlows.length ? <div className="mt-3 space-y-1.5 border-t border-slate-200 pt-3">
                    {visibleFlows.map((link) => {
                    const href = flowAreaHref(product, link, "documentacao");
                    const className = [
                      "block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      focusClass,
                      href ? "text-slate-700 hover:bg-slate-100 hover:text-brand-800" : "cursor-not-allowed text-slate-500",
                    ].join(" ");
                    const content = <>
                      <span>
                        <span className="block font-medium">{link.label}</span>
                        <span className="mt-1 flex flex-wrap gap-1">
                          {href && link.environment
                            ? <Badge tone={environmentBadgeTone(link.environment)}>{link.environment}</Badge>
                            : <StatusBadge status={link.status} />}
                          {link.tag ? <Badge>{link.tag}</Badge> : null}
                        </span>
                      </span>
                    </>;
                    return href ? (
                      <Link key={link.id} href={href} className={className}>
                        {content}
                      </Link>
                    ) : (
                      <button
                        key={link.id}
                        type="button"
                        disabled
                        aria-disabled="true"
                        className={className}
                      >
                        {content}
                      </button>
                    );
                    })}
                  </div> : null}
                </div>
              </>
            ) : (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Produtos</p>
                <ul className="space-y-1.5">
                  {navigation.products.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/docs?produto=${encodeURIComponent(item.id)}`}
                        className={"block w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-brand-800 " + focusClass}
                      >
                        <span className="min-w-0">
                          <span className="block">{item.label}</span>
                          {item.status !== "published" || item.tag ? (
                            <span className="mt-1.5 flex flex-wrap gap-1">
                              {item.status !== "published" ? <StatusBadge status={item.status} /> : null}
                              {item.tag ? <Badge>{item.tag}</Badge> : null}
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {navigation.clients ? (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <span aria-disabled="true" className="block cursor-not-allowed text-sm font-medium text-slate-500">{navigation.clients.label}</span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <StatusBadge status={navigation.clients.status} />
                      {navigation.clients.tag ? <Badge>{navigation.clients.tag}</Badge> : null}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </nav>

          <section
            aria-label="Conteúdo da documentação"
            data-documentation-active-area={selectedFlow ? selectedAreaId ?? "documentacao" : undefined}
            className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5"
          >
            {showIndex ? (
              <HorizontalDragNav className="docs-quick-nav mb-5 flex snap-x snap-proximity gap-2 overflow-x-auto pb-1 xl:hidden">
                {visibleTocItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={"shrink-0 snap-start whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-600 hover:text-brand-700 " + tocMobileIndent(item.depth) + focusClass}
                  >
                    {item.label}
                  </Link>
                ))}
              </HorizontalDragNav>
            ) : null}
            {!product ? (
              children ?? <div className="flex min-h-48 flex-col justify-center">
                <BookOpen className="h-6 w-6 text-brand-700" aria-hidden="true" />
                <h2 id="documentation-context-title" className="mt-3 text-lg font-semibold text-slate-900">Escolha um produto</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">Selecione um produto ao lado para ver sua visão geral, fluxos, estruturas técnicas e conteúdos disponíveis.</p>
              </div>
            ) : selectedFlow ? (
              <FlowPanel
                product={product}
                  link={selectedFlow}
                  areaId={(selectedAreaId as FlowAreaId) || "documentacao"}
                  routeContent={showRouteContent ? children : undefined}
                  returnTo={searchParams.get("returnTo") ?? undefined}
                  isReferenceContext={pathname.startsWith("/docs/api/") || pathname.includes("/operations/")}
                />
            ) : (
              <div>
                <nav aria-label="Contexto atual" className="text-xs text-slate-500">
                  <Link href="/docs" className={"hover:text-brand-700 " + focusClass}>Documentação</Link>
                  <span className="mx-1" aria-hidden="true">/</span>
                  <span>{product.label}</span>
                </nav>
                <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 id="documentation-context-title" className="text-xl font-semibold text-slate-900">{product.label}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{product.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {product.status !== "published" ? <StatusBadge status={product.status} /> : null}
                    {product.tag ? <Badge>{product.tag}</Badge> : null}
                  </div>
                </div>
                <div className="mt-6">
                  {selectedAreaId === "fluxograma-geral" ? (
                    <FlowchartList links={productArea?.links ?? []} />
                  ) : selectedAreaId === "roteiro-homologacao" && product.id === "credenciado" ? (
                    <CredenciadoHomologationGuide links={visibleFlows} />
                  ) : productArea?.links.some((link) => link.href) ? (
                    <p className="text-sm text-slate-600">Selecione uma integração na navbar para acessar sua documentação.</p>
                  ) : (
                    <Placeholder>Este produto ainda não possui documentação publicada nesta área.</Placeholder>
                  )}
                </div>
              </div>
            )}
          </section>
          {showIndex ? (
            <aside className="hidden xl:block">
              <div className="docs-index-scroll sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Índice</p>
                <ul className="space-y-1.5">
                  {visibleTocItems.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={"block rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-white hover:text-brand-700 " + tocDesktopIndent(item.depth) + focusClass}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
      {showScrollTop ? (
        <button
          type="button"
          aria-label="Voltar ao topo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={"fixed bottom-5 right-5 z-50 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-3 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-brand-800 " + focusClass}
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
          <span>Voltar ao topo</span>
        </button>
      ) : null}
    </div>
  );
}
