import Link from "next/link";
import { notFound } from "next/navigation";

import { ManualShellWithNav } from "@/modules/living-docs-externa/ui/reader/manual-shell-with-nav";
import { PlaygroundPanel } from "@/modules/living-docs-externa/ui/reader/playground-panel";
import { getPublishedManual } from "@/modules/living-docs-externa/services/get-published-manual";

interface PlaygroundPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ query?: string }>;
}

export default async function PlaygroundPage({ params, searchParams }: PlaygroundPageProps) {
  const { slug } = await params;
  const { query } = await searchParams;

  const project = await getPublishedManual(slug);
  if (!project) notFound();

  return (
    <ManualShellWithNav slug={slug} playground>
      <article>
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/manual" className="hover:text-brand-700">
            Manuais
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/manual/${slug}`} className="hover:text-brand-700">
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

        <PlaygroundPanel slug={slug} initialQuery={query} />
      </article>
    </ManualShellWithNav>
  );
}
