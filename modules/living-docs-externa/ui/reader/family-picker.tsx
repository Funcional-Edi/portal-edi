import { ArrowRight, Building2, Store } from "lucide-react";
import Link from "next/link";

import {
  PRODUCT_FAMILY_METADATA,
  PRODUCT_FAMILY_ORDER,
  type ProductFamily,
} from "@/modules/living-docs-externa/schema/family";
import { docsFamilyHref } from "@/modules/living-docs-externa/services/docs-routes";

const FAMILY_ICONS: Record<ProductFamily, typeof Building2> = {
  "edi-pharma": Building2,
  "edi-varejo": Store,
};

export function FamilyPicker() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {PRODUCT_FAMILY_ORDER.map((family) => {
        const metadata = PRODUCT_FAMILY_METADATA[family];
        const Icon = FAMILY_ICONS[family];

        return (
          <li key={family}>
            <Link
              href={docsFamilyHref(family)}
              className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-600 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-xl font-semibold text-slate-900">{metadata.name}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-600">{metadata.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-700 group-hover:underline">
                Ver produtos
                <ArrowRight
                  className="h-4 w-4 transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
