import { FamilyCatalog } from "@/modules/living-docs-externa/ui/reader/family-catalog";
import { DocsShell } from "@/modules/living-docs-externa/ui/reader/docs-shell";
import { docsFamilyHref } from "@/modules/living-docs-externa/services/docs-routes";
import { listPublishedManuals } from "@/modules/living-docs-externa/services/list-published-manuals";

export default async function EdiVarejoCatalogPage() {
  const manuals = await listPublishedManuals();

  return (
    <DocsShell activeHref={docsFamilyHref("edi-varejo")}>
      <FamilyCatalog family="edi-varejo" manuals={manuals} />
    </DocsShell>
  );
}
