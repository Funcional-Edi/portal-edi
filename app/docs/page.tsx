import { DocumentationIntroduction } from "@/modules/living-docs-externa/ui/reader/documentation-introduction";
import { DocsShell } from "@/modules/living-docs-externa/ui/reader/docs-shell";
import { DOCS_HOME_HREF } from "@/modules/living-docs-externa/services/docs-routes";
import { getDocumentationNavigation } from "@/modules/living-docs-externa/services/get-documentation-navigation";

export default async function DocsHomePage() {
  const navigation = await getDocumentationNavigation();
  return (
    <DocsShell activeHref={DOCS_HOME_HREF}>
      <DocumentationIntroduction products={navigation.products} />
    </DocsShell>
  );
}
