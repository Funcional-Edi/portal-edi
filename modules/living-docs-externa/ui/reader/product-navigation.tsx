"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Code2,
  FileText,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Badge, environmentBadgeTone } from "@/core/ui/badge";
import type {
  DocumentationActionView,
  DocumentationLinkView,
  DocumentationNavigationView,
  DocumentationOperationView,
  DocumentationProductView,
} from "@/modules/living-docs-externa/schema/documentation-navigation";
import { documentationRouteSelection } from "@/modules/living-docs-externa/services/documentation-navigation";
import { DocumentationStatusBadge as StatusBadge } from "@/modules/living-docs-externa/ui/reader/documentation-status";

const focusClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2";

const FLOW_AREAS = [
  { id: "documentacao", label: "Documentação", icon: FileText },
  { id: "queries", label: "Queries", icon: Code2 },
  { id: "mutations", label: "Mutations", icon: Code2 },
  { id: "metodos", label: "Métodos", icon: Code2 },
  { id: "teste-de-requisicao", label: "Teste de Requisição", icon: ArrowRight },
] as const;

type ProductAreaId = "visao-geral" | "fluxograma-geral" | "roteiro-homologacao";
type FlowAreaId = (typeof FLOW_AREAS)[number]["id"];

function flowAreaHref(product: DocumentationProductView, link: DocumentationLinkView, areaId: FlowAreaId) {
  if (areaId === "documentacao") {
    return product.actions.find((action) => action.id === "visao-geral")?.links.find((item) => item.id === link.id)?.href;
  }
  if (areaId === "teste-de-requisicao") {
    return product.actions.find((action) => action.id === "teste-de-requisicao")?.links.find((item) => item.id === link.id)?.href;
  }
  return null;
}

function availableFlowAreas(product: DocumentationProductView, link: DocumentationLinkView) {
  const operations = link.operations ?? [];
  return FLOW_AREAS.filter((area) => {
    if (area.id === "documentacao" || area.id === "teste-de-requisicao") {
      return Boolean(flowAreaHref(product, link, area.id));
    }
    const kind = area.id === "queries" ? "query" : area.id === "mutations" ? "mutation" : "rest";
    return operations.some((operation) => operation.kind === kind);
  });
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

function FlowPanel({
  product,
  link,
  areaId,
  routeContent,
}: {
  product: DocumentationProductView;
  link: DocumentationLinkView;
  areaId: FlowAreaId;
  routeContent?: ReactNode;
}) {
  const operations = link.operations ?? [];

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
        <Link href={`/docs?produto=${encodeURIComponent(product.id)}`} className={"inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline " + focusClass}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar às áreas
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

export function ProductNavigation({
  navigation,
  tocItems = [],
  children,
}: {
  navigation: DocumentationNavigationView;
  tocItems?: { href: string; label: string }[];
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<ProductAreaId | FlowAreaId | null>(null);
  const active = documentationRouteSelection(navigation, pathname);
  const activeProductId = active?.productId;
  const activeModuleId = active?.moduleId;
  const activeActionId = active?.actionId;
  const requestedProductId = searchParams.get("produto");
  const productIdFromQuery = navigation.products.some((item) => item.id === requestedProductId) ? requestedProductId : null;

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
  const selectedFlow = flows.find((link) => link.id === selectedFlowId) ?? null;
  const productArea = product?.actions.find((action) => action.id === selectedAreaId);
  const flowAreas = product && selectedFlow ? availableFlowAreas(product, selectedFlow) : [];
  const showRouteContent = children != null
    && activeProductId === selectedProductId
    && activeModuleId === selectedFlowId
    && activeActionId === selectedAreaId;
  const showIndex = showRouteContent && tocItems.length > 0;

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
                <Link href={`/docs?produto=${encodeURIComponent(product.id)}`} className={"mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline " + focusClass}>
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> {product.label}
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
                      <Link key={area.id} href={href} aria-current={area.id === selectedAreaId ? "page" : undefined} className={className}>
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
                <div className="space-y-1.5">
                  {product.actions.filter((action) => action.id !== "fluxos" && action.id !== "teste-de-requisicao").map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      aria-pressed={action.id === selectedAreaId}
                      onClick={() => setSelectedAreaId(action.id as ProductAreaId)}
                      className={[
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm",
                        focusClass,
                        action.id === selectedAreaId ? "bg-brand-50 font-semibold text-brand-800" : "text-slate-700 hover:bg-slate-100",
                      ].join(" ")}
                    >
                      <span>
                        <span className="block">{action.label}</span>
                        <ActionStatus action={action} />
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                  {flows.length ? <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Integrações</p> : null}
                  {flows.map((link) => {
                    const href = flowAreaHref(product, link, "documentacao");
                    const className = [
                      "flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm",
                      focusClass,
                      href ? "text-slate-700 hover:bg-slate-100" : "cursor-not-allowed text-slate-500",
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
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
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
                        className={"flex w-full items-start justify-between gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 " + focusClass}
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
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
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

          <section aria-label="Conteúdo da documentação" className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
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
                  {product.status !== "published" ? <StatusBadge status={product.status} /> : null}
                </div>
                <div className="mt-6">
                  {selectedAreaId === "fluxograma-geral" ? (
                    <Placeholder>Espaço reservado para o fluxograma geral deste produto.</Placeholder>
                  ) : selectedAreaId === "roteiro-homologacao" ? (
                    <Placeholder>Espaço reservado para o Roteiro de Homologação.</Placeholder>
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
              <div className="sticky top-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Índice</p>
                <ul className="space-y-1.5">
                  {tocItems.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={"block rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-white hover:text-brand-700 " + focusClass}>
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
    </div>
  );
}
