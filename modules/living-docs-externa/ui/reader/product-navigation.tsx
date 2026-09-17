"use client";

import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge, environmentBadgeTone } from "@/core/ui/badge";
import type { DocumentationNavigationView } from "@/modules/living-docs-externa/schema/documentation-navigation";
import { documentationRouteSelection } from "@/modules/living-docs-externa/services/documentation-navigation";
import { DocumentationStatusBadge as StatusBadge } from "@/modules/living-docs-externa/ui/reader/documentation-status";

const focusClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2";

export function ProductNavigation({ navigation }: { navigation: DocumentationNavigationView }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [choice, setChoice] = useState<{ path: string; productId: string | null; actionId: string } | null>(null);

  useEffect(() => {
    const update = () => { setHash(window.location.hash); setChoice(null); };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);

  const active = documentationRouteSelection(navigation, pathname, hash);
  const localChoice = choice?.path === pathname ? choice : null;
  const expandedId = localChoice ? localChoice.productId : active?.productId;

  return (
    <nav aria-label="Produtos EDI" className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Produtos EDI</p>
        <button
          type="button"
          aria-label="Mostrar produtos"
          aria-expanded={mobileOpen}
          aria-controls="edi-product-list"
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden ${focusClass}`}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div id="edi-product-list" className={`${mobileOpen ? "block" : "hidden"} p-2 lg:block`}>
        <ul className="space-y-1">
          {navigation.products.map((product) => {
            const expanded = product.id === expandedId;
            const currentProduct = product.id === active?.productId;
            const actionId = localChoice?.productId === product.id ? localChoice.actionId : currentProduct ? active?.actionId : undefined;
            const action = product.actions.find((item) => item.id === actionId) ?? product.actions[0];
            return (
              <li key={product.id}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`product-${product.id}`}
                  aria-current={currentProduct ? "location" : undefined}
                  onClick={() => setChoice({ path: pathname, productId: expanded ? null : product.id, actionId: action?.id ?? "documentacao" })}
                  className={`flex w-full items-start justify-between gap-2 rounded-lg px-3 py-3 text-left transition ${focusClass} ${expanded || currentProduct ? "bg-brand-50 text-brand-800" : "text-slate-700 hover:bg-slate-100"}`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{product.label}</span>
                    {product.status !== "published" || product.tag ? (
                      <span className="mt-1.5 flex flex-wrap gap-1">
                        {product.status !== "published" ? <StatusBadge status={product.status} /> : null}
                        {product.tag ? <Badge>{product.tag}</Badge> : null}
                      </span>
                    ) : null}
                  </span>
                  {expanded ? <ChevronDown className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                </button>
                <div id={`product-${product.id}`} hidden={!expanded} className="mx-2 mb-3 border-l border-brand-200 py-2 pl-3">
                  <p className="mb-3 text-xs leading-relaxed text-slate-500">{product.description}</p>
                  <div aria-label={`Seções de ${product.label}`} className="space-y-1">
                    {product.actions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={item.id === action?.id}
                        aria-controls={`modules-${product.id}`}
                        onClick={() => setChoice({ path: pathname, productId: product.id, actionId: item.id })}
                        className={`block w-full rounded-md px-2 py-1.5 text-left text-sm ${focusClass} ${item.id === action?.id ? "bg-brand-50 font-medium text-brand-800" : "text-slate-600 hover:bg-slate-100"}`}
                      >
                        {item.label}
                        {item.tag ? <span className="ml-1"><Badge>{item.tag}</Badge></span> : null}
                      </button>
                    ))}
                  </div>
                  <div id={`modules-${product.id}`} className="mt-3 border-t border-slate-100 pt-3">
                    <p className="px-2 text-xs font-medium text-slate-500">{action?.label ?? "Conteúdo"} · módulos</p>
                    {action?.links.length ? (
                      <ul className="mt-2 space-y-1">
                        {action.links.map((link) => {
                          const current = currentProduct && active?.actionId === action.id && active.moduleId === link.id;
                          const content = <>
                            <span className="block text-sm">{link.label}</span>
                            <span className="mt-1 flex flex-wrap gap-1">
                              {link.href && link.environment ? <Badge tone={environmentBadgeTone(link.environment)}>{link.environment}</Badge> : <StatusBadge status={link.status} />}
                              {link.tag ? <Badge>{link.tag}</Badge> : null}
                            </span>
                          </>;
                          return (
                            <li key={link.id}>
                              {link.href ? (
                                <Link
                                  href={link.href}
                                  aria-current={current ? "page" : undefined}
                                  onClick={() => { setChoice(null); setHash(new URL(link.href!, window.location.origin).hash); setMobileOpen(false); }}
                                  className={`block rounded-md px-2 py-2 ${focusClass} ${current ? "bg-brand-50 font-medium text-brand-800" : "text-slate-700 hover:bg-slate-100"}`}
                                >{content}</Link>
                              ) : (
                                <span aria-disabled="true" className="block cursor-not-allowed rounded-md px-2 py-2 text-slate-500">{content}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : <p className="px-2 py-3 text-xs text-slate-500">Sem documentação disponível nesta seção.</p>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
