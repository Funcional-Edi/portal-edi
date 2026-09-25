export function PortalFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-8 pt-2 text-xs text-slate-500 sm:px-6">
      <span>© {new Date().getFullYear()} Funcional Health Tech</span>
      <span aria-hidden="true">•</span>
      <span>Portal de Integração EDI</span>
      <span aria-hidden="true">•</span>
      <span>Todos os direitos reservados</span>
    </footer>
  );
}
