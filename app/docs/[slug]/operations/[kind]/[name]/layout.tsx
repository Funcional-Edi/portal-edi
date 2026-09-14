import { ManualShellWithNav } from "@/modules/living-docs-externa/ui/reader/manual-shell-with-nav";

interface OperationLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string; kind: string; name: string }>;
}

export default async function OperationLayout({ children, params }: OperationLayoutProps) {
  const { slug, kind, name } = await params;

  return (
    <ManualShellWithNav slug={slug} kind={kind} name={name}>
      {children}
    </ManualShellWithNav>
  );
}
