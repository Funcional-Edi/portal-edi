import { notFound } from "next/navigation";

import { getInternoGuide } from "@/modules/manuais-internos/services/get-guide";
import { InternoShell } from "@/modules/manuais-internos/ui/interno-shell";
import { GuideViewer } from "@/modules/manuais-internos/ui/guide-viewer";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export default async function InternoGuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = await getInternoGuide(slug);
  if (!guide) notFound();

  return (
    <InternoShell
      navItems={[
        { href: "/interno", label: "Guias" },
        { href: `/interno/${slug}`, label: guide.title, active: true },
      ]}
    >
      <GuideViewer guide={guide} />
    </InternoShell>
  );
}
