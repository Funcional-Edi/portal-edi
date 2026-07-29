interface ManualLayoutProps {
  children: React.ReactNode;
}

/** Repassa children — cada rota monta seu próprio ManualShell onde necessário. */
export default function ManualLayout({ children }: ManualLayoutProps) {
  return children;
}
