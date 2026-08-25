interface DocsApiLayoutProps {
  children: React.ReactNode;
}

/** Repassa children — cada rota monta DocsApiShell onde necessário. */
export default function DocsApiLayout({ children }: DocsApiLayoutProps) {
  return children;
}
