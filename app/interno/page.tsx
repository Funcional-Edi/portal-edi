import { InternoShell } from "@/modules/manuais-internos/ui/interno-shell";
import { GuideCatalog } from "@/modules/manuais-internos/ui/guide-catalog";
import { listInternoGuides } from "@/modules/manuais-internos/services/list-guides";

export default async function InternoCatalogPage() {
  const guides = await listInternoGuides();

  return (
    <InternoShell navItems={[{ href: "/interno", label: "Guias", active: true }]}>
      <GuideCatalog guides={guides} />
    </InternoShell>
  );
}
