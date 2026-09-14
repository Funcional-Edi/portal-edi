import Link from "next/link";
import { notFound } from "next/navigation";

import { auth, isAdminRole } from "@/core/auth";
import { ManualShellWithNav } from "@/modules/living-docs-externa/ui/reader/manual-shell-with-nav";
import { PlaygroundPanel } from "@/modules/living-docs-externa/ui/reader/playground-panel";
import {
  DOCS_HOME_HREF,
  docsGuideHref,
} from "@/modules/living-docs-externa/services/docs-routes";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";

interface PlaygroundPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ query?: string }>;
}

export default async function PlaygroundPage({ params, searchParams }: PlaygroundPageProps) {
  const { slug } = await params;
  const { query } = await searchParams;
  const session = await auth();
  const canUsePlayground = Boolean(session?.user?.role && isAdminRole(session.user.role));

  const project = await getPublishedManual(slug);
  if (!project) notFound();

  return (
    <ManualShellWithNav slug={slug} playground project={project}>
      <article>
        <nav className="mb-6 text-sm text-slate-500">
          <Link href={DOCS_HOME_HREF} className="hover:text-brand-700">
            Documentação
          </Link>
          <span className="mx-2">/</span>
          <Link href={docsGuideHref(slug)} className="hover:text-brand-700">
            {project.manual.title}
          </Link>
        </nav>

        <header className="mb-6 border-b border-slate-200 pb-6">
          <p className="text-sm font-medium text-brand-700">Playground GraphQL</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{project.manual.title}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Execute apenas as operações documentadas neste manual contra o gateway real do
            projeto. As credenciais do gateway ficam sempre no servidor.
          </p>
        </header>

        {canUsePlayground ? (
          <PlaygroundPanel slug={slug} initialQuery={query} />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
            <p className="font-medium">Acesso restrito a perfil admin</p>
            <p className="mt-2">
              O playground executa queries e mutations contra o gateway real usando credenciais
              salvas no servidor. Por segurança, apenas usuários com perfil{" "}
              <span className="font-medium">admin</span> podem usar esta ferramenta.
            </p>
            <Link
              href={docsGuideHref(slug)}
              className="mt-4 inline-flex text-sm font-medium text-brand-700 hover:underline"
            >
              ← Voltar ao roteiro
            </Link>
          </div>
        )}
      </article>
    </ManualShellWithNav>
  );
}
